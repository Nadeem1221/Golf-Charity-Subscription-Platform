const express = require('express');
const router = express.Router();
const {
  createCheckoutSession, cancelSubscription, getSubscriptionStatus, handleWebhook,
} = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

// Webhook — raw body, no auth middleware
router.post('/webhook', handleWebhook);

// Authenticated routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/cancel-subscription',     protect, cancelSubscription);
router.get('/subscription-status',      protect, getSubscriptionStatus);

module.exports = router;
