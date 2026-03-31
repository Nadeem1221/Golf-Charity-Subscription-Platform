const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Charity name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    logo: { type: String, default: null },
    images: [{ type: String }],
    website: { type: String, default: null },
    category: {
      type: String,
      enum: ['health', 'education', 'environment', 'community', 'sports', 'other'],
      default: 'other',
    },
    country: { type: String, default: null },

    // Upcoming events (e.g. charity golf days)
    events: [
      {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        location: { type: String },
        description: { type: String },
        _id: false,
      },
    ],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Running total donated to this charity (updated on each subscription cycle)
    totalDonated: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from name
charitySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Charity', charitySchema);
