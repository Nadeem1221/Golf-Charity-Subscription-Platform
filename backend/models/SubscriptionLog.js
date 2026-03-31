const mongoose = require('mongoose');

// Audit trail of every subscription payment / event
const subscriptionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: String,
      enum: [
        'subscription_created',
        'subscription_renewed',
        'subscription_cancelled',
        'subscription_lapsed',
        'payment_succeeded',
        'payment_failed',
      ],
      required: true,
    },
    plan: { type: String, enum: ['monthly', 'yearly', null], default: null },
    amount: { type: Number, default: 0 }, // in pence/cents
    currency: { type: String, default: 'gbp' },
    stripeEventId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionLog', subscriptionLogSchema);
