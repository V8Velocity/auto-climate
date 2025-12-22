const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema({
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
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    }
  },
  conditions: {
    temperatureMin: { type: Number },
    temperatureMax: { type: Number },
    humidity: { type: Number },
    windSpeed: { type: Number },
    weatherTypes: [{ type: String }], // rain, snow, storm, etc.
    aqi: { type: Number }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationMethods: {
    email: { type: Boolean, default: false },
    browser: { type: Boolean, default: true }
  },
  lastTriggered: {
    type: Date,
    default: null
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

weatherAlertSchema.index({ userId: 1, isActive: 1 });

weatherAlertSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const WeatherAlert = mongoose.model('WeatherAlert', weatherAlertSchema);

module.exports = WeatherAlert;
