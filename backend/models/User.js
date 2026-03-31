const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password in queries by default
    },
    role: {
      type: String,
      enum: ['subscriber', 'admin'],
      default: 'subscriber',
    },

    // ─── Subscription ────────────────────────────────────────────
    subscription: {
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'lapsed'],
        default: 'inactive',
      },
      plan: {
        type: String,
        enum: ['monthly', 'yearly', null],
        default: null,
      },
      stripeCustomerId: { type: String, default: null },
      stripeSubscriptionId: { type: String, default: null },
      currentPeriodStart: { type: Date, default: null },
      currentPeriodEnd: { type: Date, default: null },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },

    // ─── Charity ─────────────────────────────────────────────────
    selectedCharity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charity',
      default: null,
    },
    charityContributionPercent: {
      type: Number,
      default: 10, // minimum 10%
      min: 10,
      max: 100,
    },

    // ─── Profile ─────────────────────────────────────────────────
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    country: { type: String, default: null },

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Hash password before save ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare password ─────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Virtual: subscription is active ─────────────────────────────────────────
userSchema.virtual('isSubscribed').get(function () {
  return (
    this.subscription.status === 'active' &&
    this.subscription.currentPeriodEnd &&
    new Date(this.subscription.currentPeriodEnd) > new Date()
  );
});

module.exports = mongoose.model('User', userSchema);
