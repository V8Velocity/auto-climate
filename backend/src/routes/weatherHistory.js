const express = require('express');
const router = express.Router();
const WeatherHistory = require('../models/WeatherHistory');
const { authenticate } = require('../middleware/auth');

// Get weather history for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { city, days = 7, limit = 100 } = req.query;
    
    const query = { userId: req.userId };
    
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    
    // Get records from last N days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    query.timestamp = { $gte: daysAgo };
    
    const history = await WeatherHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({ history, count: history.length });
  } catch (error) {
    console.error('Get weather history error:', error);
    res.status(500).json({ error: 'Failed to fetch weather history' });
  }
});

// Add weather snapshot
router.post('/', authenticate, async (req, res) => {
  try {
    const { location, weatherData } = req.body;
    
    if (!location || !weatherData) {
      return res.status(400).json({ error: 'Location and weather data are required' });
    }
    
    const snapshot = new WeatherHistory({
      userId: req.userId,
      location,
      weatherData
    });
    
    await snapshot.save();
    res.status(201).json({ snapshot });
  } catch (error) {
    console.error('Add weather history error:', error);
    res.status(500).json({ error: 'Failed to save weather snapshot' });
  }
});

// Get weather trends for a location
router.get('/trends/:city', authenticate, async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    
    const history = await WeatherHistory.find({
      userId: req.userId,
      'location.city': new RegExp(city, 'i'),
      timestamp: { $gte: daysAgo }
    }).sort({ timestamp: 1 });
    
    // Calculate trends
    const temps = history.map(h => h.weatherData.temperature);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length || 0;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    res.json({
      city,
      period: `${days} days`,
      dataPoints: history.length,
      trends: {
        avgTemperature: avgTemp.toFixed(1),
        maxTemperature: maxTemp,
        minTemperature: minTemp
      },
      history
    });
  } catch (error) {
    console.error('Get weather trends error:', error);
    res.status(500).json({ error: 'Failed to fetch weather trends' });
  }
});

// Delete old weather history (cleanup)
router.delete('/cleanup', authenticate, async (req, res) => {
  try {
    const { days = 90 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await WeatherHistory.deleteMany({
      userId: req.userId,
      timestamp: { $lt: cutoffDate }
    });
    
    res.json({ 
      message: `Deleted ${result.deletedCount} old records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup weather history error:', error);
    res.status(500).json({ error: 'Failed to cleanup weather history' });
  }
});

module.exports = router;
