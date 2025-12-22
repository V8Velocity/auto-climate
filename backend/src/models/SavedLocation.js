const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lon: {
      type: Number,
      required: true
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

savedLocationSchema.index({ userId: 1, city: 1, country: 1 }, { unique: true });

savedLocationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const SavedLocation = mongoose.model('SavedLocation', savedLocationSchema);

module.exports = SavedLocation;
