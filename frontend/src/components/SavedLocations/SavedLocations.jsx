import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { locationsAPI, reverseGeocode } from '../../services/api';
import './SavedLocations.css';

export default function SavedLocations({ onLocationSelect }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', city: '', country: '', lat: '', lon: '' });
  const { isAuthenticated } = useAuth();
  const { location: gpsLocation, getLocation, loading: gpsLoading } = useGeolocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);

  const fetchLocations = async () => {
    try {
      const data = await locationsAPI.getAll();
      setLocations(data.locations);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    console.log('[SavedLocations] Use Current Location clicked');
    getLocation();
  };

  useEffect(() => {
    console.log('[SavedLocations] GPS Location changed:', gpsLocation);
    if (gpsLocation) {
      console.log('[SavedLocations] Calling handleGPSLocation...');
      handleGPSLocation();
    }
  }, [gpsLocation]);

  const handleGPSLocation = async () => {
    console.log('[SavedLocations] handleGPSLocation called with:', gpsLocation);
    try {
      console.log('[SavedLocations] Calling reverseGeocode API...');
      const geocoded = await reverseGeocode(gpsLocation.lat, gpsLocation.lon);
      console.log('[SavedLocations] Reverse geocode result:', geocoded);
      
      if (geocoded) {
        if (onLocationSelect) {
          console.log('[SavedLocations] Calling onLocationSelect with:', {
            city: geocoded.city,
            country: geocoded.country,
            coordinates: { lat: gpsLocation.lat, lon: gpsLocation.lon }
          });
          onLocationSelect({
            city: geocoded.city,
            country: geocoded.country,
            coordinates: { lat: gpsLocation.lat, lon: gpsLocation.lon }
          });
        } else {
          console.warn('[SavedLocations] onLocationSelect callback not provided');
        }
      } else {
        console.error('[SavedLocations] Reverse geocode returned null/undefined');
      }
    } catch (error) {
      console.error('[SavedLocations] Error in handleGPSLocation:', error);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await locationsAPI.add({
        name: newLocation.name,
        city: newLocation.city,
        country: newLocation.country,
        coordinates: {
          lat: parseFloat(newLocation.lat),
          lon: parseFloat(newLocation.lon)
        }
      });
      setNewLocation({ name: '', city: '', country: '', lat: '', lon: '' });
      setShowAddForm(false);
      fetchLocations();
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (confirm('Delete this location?')) {
      try {
        await locationsAPI.delete(id);
        fetchLocations();
      } catch (error) {
        console.error('Failed to delete location:', error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await locationsAPI.update(id, { isDefault: true });
      fetchLocations();
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  const handleSelectLocation = (location) => {
    if (onLocationSelect) {
      onLocationSelect({
        city: location.city,
        country: location.country,
        coordinates: location.coordinates
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="saved-locations-card">
        <div className="saved-locations-header">
          <MapPin size={20} />
          <h3>Saved Locations</h3>
        </div>
        <p className="auth-prompt">Sign in to save locations</p>
      </div>
    );
  }

  return (
    <div className="saved-locations-card">
      <div className="saved-locations-header">
        <MapPin size={20} />
        <h3>Saved Locations</h3>
        <button 
          className="add-location-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
          title="Add Location"
        >
          <Plus size={18} />
        </button>
      </div>

      <button 
        className="gps-location-btn" 
        onClick={handleUseCurrentLocation}
        disabled={gpsLoading}
      >
        <Navigation size={18} />
        {gpsLoading ? 'Getting location...' : 'Use Current Location'}
      </button>

      {showAddForm && (
        <form className="add-location-form" onSubmit={handleAddLocation}>
          <input
            type="text"
            placeholder="Location Name"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={newLocation.city}
            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={newLocation.country}
            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
            required
          />
          <div className="coords-inputs">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={newLocation.lat}
              onChange={(e) => setNewLocation({ ...newLocation, lat: e.target.value })}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={newLocation.lon}
              onChange={(e) => setNewLocation({ ...newLocation, lon: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="locations-list">
        {loading ? (
          <p className="loading-text">Loading locations...</p>
        ) : locations.length === 0 ? (
          <p className="empty-text">No saved locations yet</p>
        ) : (
          locations.map((location) => (
            <div key={location._id} className="location-item">
              <div 
                className="location-info"
                onClick={() => handleSelectLocation(location)}
              >
                <div className="location-name">
                  {location.name}
                  {location.isDefault && <Star size={14} className="default-star" />}
                </div>
                <div className="location-details">
                  {location.city}, {location.country}
                </div>
              </div>
              <div className="location-actions">
                {!location.isDefault && (
                  <button
                    className="action-btn"
                    onClick={() => handleSetDefault(location._id)}
                    title="Set as default"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteLocation(location._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
