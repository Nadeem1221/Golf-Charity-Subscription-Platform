const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const SubscriptionLog = require('../models/SubscriptionLog');

const PLAN_PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  yearly:  process.env.STRIPE_YEARLY_PRICE_ID,
};

// ─── POST /api/stripe/create-checkout-session ─────────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'

    if (!PLAN_PRICE_IDS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    // Get or create Stripe customer
    let customerId = req.user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.stripeCustomerId': customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url:  `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/stripe/cancel-subscription ─────────────────────────────────────
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subId = user.subscription.stripeSubscriptionId;

    if (!subId) {
      return res.status(400).json({ success: false, message: 'No active subscription found' });
    }

    // Cancel at period end (user keeps access until billing period ends)
    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    res.json({ success: true, message: 'Subscription will cancel at end of billing period' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/stripe/subscription-status ─────────────────────────────────────
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/stripe/webhook ─────────────────────────────────────────────────
// Stripe sends events here — must be registered in Stripe Dashboard
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription') {
          const userId = session.metadata.userId;
          const plan   = session.metadata.plan;
          const sub    = await stripe.subscriptions.retrieve(session.subscription);

          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'active',
            'subscription.plan': plan,
            'subscription.stripeSubscriptionId': sub.id,
            'subscription.currentPeriodStart': new Date(sub.current_period_start * 1000),
            'subscription.currentPeriodEnd':   new Date(sub.current_period_end   * 1000),
            'subscription.cancelAtPeriodEnd':  false,
          });

          await SubscriptionLog.create({
            user: userId,
            event: 'subscription_created',
            plan,
            amount: session.amount_total,
            stripeEventId: event.id,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          const customer = await stripe.customers.retrieve(sub.customer);
          const userId = customer.metadata.userId;
          if (!userId) break;

          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'active',
            'subscription.currentPeriodStart': new Date(sub.current_period_start * 1000),
            'subscription.currentPeriodEnd':   new Date(sub.current_period_end   * 1000),
          });

          await SubscriptionLog.create({
            user: userId,
            event: 'payment_succeeded',
            amount: invoice.amount_paid,
            stripeEventId: event.id,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          const customer = await stripe.customers.retrieve(sub.customer);
          const userId = customer.metadata.userId;
          if (!userId) break;

          await User.findByIdAndUpdate(userId, { 'subscription.status': 'lapsed' });
          await SubscriptionLog.create({ user: userId, event: 'payment_failed', stripeEventId: event.id });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        const userId = customer.metadata.userId;
        if (!userId) break;

        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'cancelled',
          'subscription.stripeSubscriptionId': null,
        });
        await SubscriptionLog.create({ user: userId, event: 'subscription_cancelled', stripeEventId: event.id });
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};
