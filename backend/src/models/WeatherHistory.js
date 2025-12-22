const mongoose = require('mongoose');

const weatherHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    }
  },
  weatherData: {
    temperature: { type: Number, required: true },
    feelsLike: { type: Number },
    humidity: { type: Number },
    pressure: { type: Number },
    windSpeed: { type: Number },
    windDirection: { type: Number },
    description: { type: String },
    icon: { type: String },
    clouds: { type: Number },
    visibility: { type: Number },
    uvIndex: { type: Number },
    aqi: { type: Number }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

weatherHistorySchema.index({ userId: 1, timestamp: -1 });
weatherHistorySchema.index({ 'location.city': 1, timestamp: -1 });

const WeatherHistory = mongoose.model('WeatherHistory', weatherHistorySchema);

module.exports = WeatherHistory;
