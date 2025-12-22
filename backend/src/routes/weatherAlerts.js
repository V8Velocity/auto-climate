const express = require('express');
const router = express.Router();
const WeatherAlert = require('../models/WeatherAlert');
const { authenticate } = require('../middleware/auth');

// Get all alerts for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = { userId: req.userId };
    
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }
    
    const alerts = await WeatherAlert.find(query).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create new alert
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, location, conditions, notificationMethods } = req.body;
    
    if (!name || !location || !conditions) {
      return res.status(400).json({ error: 'Name, location, and conditions are required' });
    }
    
    const alert = new WeatherAlert({
      userId: req.userId,
      name,
      location,
      conditions,
      notificationMethods: notificationMethods || { browser: true }
    });
    
    await alert.save();
    res.status(201).json({ alert });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, conditions, isActive, notificationMethods } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (conditions) updates.conditions = conditions;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (notificationMethods) updates.notificationMethods = notificationMethods;
    
    const alert = await WeatherAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ alert });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const alert = await WeatherAlert.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Check alerts for current weather (called by weather service)
router.post('/check', authenticate, async (req, res) => {
  try {
    const { location, weatherData } = req.body;
    
    if (!location || !weatherData) {
      return res.status(400).json({ error: 'Location and weather data are required' });
    }
    
    const alerts = await WeatherAlert.find({
      userId: req.userId,
      isActive: true,
      'location.city': location.city
    });
    
    const triggeredAlerts = [];
    
    for (const alert of alerts) {
      let triggered = false;
      const { conditions } = alert;
      
      // Check temperature
      if (conditions.temperatureMin && weatherData.temperature < conditions.temperatureMin) {
        triggered = true;
      }
      if (conditions.temperatureMax && weatherData.temperature > conditions.temperatureMax) {
        triggered = true;
      }
      
      // Check humidity
      if (conditions.humidity && weatherData.humidity > conditions.humidity) {
        triggered = true;
      }
      
      // Check wind speed
      if (conditions.windSpeed && weatherData.windSpeed > conditions.windSpeed) {
        triggered = true;
      }
      
      // Check weather types
      if (conditions.weatherTypes && conditions.weatherTypes.length > 0) {
        const weatherDesc = weatherData.description?.toLowerCase() || '';
        if (conditions.weatherTypes.some(type => weatherDesc.includes(type.toLowerCase()))) {
          triggered = true;
        }
      }
      
      // Check AQI
      if (conditions.aqi && weatherData.aqi > conditions.aqi) {
        triggered = true;
      }
      
      if (triggered) {
        triggeredAlerts.push(alert);
        
        // Update last triggered time
        alert.lastTriggered = new Date();
        await alert.save();
      }
    }
    
    res.json({ 
      triggered: triggeredAlerts.length > 0,
      alerts: triggeredAlerts
    });
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ error: 'Failed to check alerts' });
  }
});

module.exports = router;
