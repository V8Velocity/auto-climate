const express = require('express');
const router = express.Router();
const SavedLocation = require('../models/SavedLocation');
const { authenticate } = require('../middleware/auth');

// Get all saved locations for user
router.get('/', authenticate, async (req, res) => {
  try {
    const locations = await SavedLocation.find({ userId: req.userId })
      .sort({ order: 1, createdAt: 1 });
    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Add new saved location
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, city, country, coordinates, isDefault } = req.body;
    
    if (!name || !city || !country || !coordinates) {
      return res.status(400).json({ error: 'Name, city, country, and coordinates are required' });
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await SavedLocation.updateMany(
        { userId: req.userId },
        { $set: { isDefault: false } }
      );
    }
    
    // Get max order for new location
    const maxOrder = await SavedLocation.findOne({ userId: req.userId })
      .sort({ order: -1 })
      .select('order');
    
    const location = new SavedLocation({
      userId: req.userId,
      name,
      city,
      country,
      coordinates,
      isDefault: isDefault || false,
      order: maxOrder ? maxOrder.order + 1 : 0
    });
    
    await location.save();
    res.status(201).json({ location });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Location already saved' });
    }
    console.error('Add location error:', error);
    res.status(500).json({ error: 'Failed to add location' });
  }
});

// Update saved location
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, isDefault, order } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (typeof isDefault === 'boolean') {
      updates.isDefault = isDefault;
      
      // If setting as default, unset other defaults
      if (isDefault) {
        await SavedLocation.updateMany(
          { userId: req.userId, _id: { $ne: req.params.id } },
          { $set: { isDefault: false } }
        );
      }
    }
    if (typeof order === 'number') updates.order = order;
    
    const location = await SavedLocation.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true }
    );
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete saved location
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const location = await SavedLocation.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// Reorder locations
router.post('/reorder', authenticate, async (req, res) => {
  try {
    const { locationIds } = req.body;
    
    if (!Array.isArray(locationIds)) {
      return res.status(400).json({ error: 'locationIds must be an array' });
    }
    
    const updates = locationIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.userId },
        update: { $set: { order: index } }
      }
    }));
    
    await SavedLocation.bulkWrite(updates);
    res.json({ message: 'Locations reordered successfully' });
  } catch (error) {
    console.error('Reorder locations error:', error);
    res.status(500).json({ error: 'Failed to reorder locations' });
  }
});

module.exports = router;
