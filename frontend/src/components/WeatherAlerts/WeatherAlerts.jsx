import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { weatherAlertsAPI } from '../../services/api';
import './WeatherAlerts.css';

export default function WeatherAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    location: { city: '', country: '', coordinates: { lat: '', lon: '' } },
    conditions: {
      temperatureMin: '',
      temperatureMax: '',
      humidity: '',
      windSpeed: '',
      weatherTypes: [],
      aqi: ''
    },
    notificationMethods: { email: false, browser: true }
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated]);

  const fetchAlerts = async () => {
    try {
      const data = await weatherAlertsAPI.getAll();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const alertData = {
      name: formData.name,
      location: {
        city: formData.location.city,
        country: formData.location.country,
        coordinates: {
          lat: parseFloat(formData.location.coordinates.lat),
          lon: parseFloat(formData.location.coordinates.lon)
        }
      },
      conditions: {
        ...(formData.conditions.temperatureMin && { temperatureMin: parseFloat(formData.conditions.temperatureMin) }),
        ...(formData.conditions.temperatureMax && { temperatureMax: parseFloat(formData.conditions.temperatureMax) }),
        ...(formData.conditions.humidity && { humidity: parseFloat(formData.conditions.humidity) }),
        ...(formData.conditions.windSpeed && { windSpeed: parseFloat(formData.conditions.windSpeed) }),
        ...(formData.conditions.aqi && { aqi: parseFloat(formData.conditions.aqi) }),
        weatherTypes: formData.conditions.weatherTypes
      },
      notificationMethods: formData.notificationMethods
    };

    try {
      if (editingAlert) {
        await weatherAlertsAPI.update(editingAlert._id, alertData);
      } else {
        await weatherAlertsAPI.create(alertData);
      }
      resetForm();
      fetchAlerts();
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: { city: '', country: '', coordinates: { lat: '', lon: '' } },
      conditions: {
        temperatureMin: '',
        temperatureMax: '',
        humidity: '',
        windSpeed: '',
        weatherTypes: [],
        aqi: ''
      },
      notificationMethods: { email: false, browser: true }
    });
    setShowCreateForm(false);
    setEditingAlert(null);
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      name: alert.name,
      location: alert.location,
      conditions: {
        temperatureMin: alert.conditions.temperatureMin || '',
        temperatureMax: alert.conditions.temperatureMax || '',
        humidity: alert.conditions.humidity || '',
        windSpeed: alert.conditions.windSpeed || '',
        weatherTypes: alert.conditions.weatherTypes || [],
        aqi: alert.conditions.aqi || ''
      },
      notificationMethods: alert.notificationMethods
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this alert?')) {
      try {
        await weatherAlertsAPI.delete(id);
        fetchAlerts();
      } catch (error) {
        console.error('Failed to delete alert:', error);
      }
    }
  };

  const handleToggleActive = async (alert) => {
    try {
      await weatherAlertsAPI.update(alert._id, { isActive: !alert.isActive });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const handleWeatherTypeToggle = (type) => {
    const current = formData.conditions.weatherTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, weatherTypes: updated }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="weather-alerts-card">
        <div className="alerts-header">
          <Bell size={20} />
          <h3>Weather Alerts</h3>
        </div>
        <p className="auth-prompt">Sign in to create custom alerts</p>
      </div>
    );
  }

  return (
    <div className="weather-alerts-card">
      <div className="alerts-header">
        <Bell size={20} />
        <h3>Weather Alerts</h3>
        <button 
          className="add-alert-btn" 
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Create Alert"
        >
          {showCreateForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {showCreateForm && (
        <form className="alert-form" onSubmit={handleSubmit}>
          <h4>{editingAlert ? 'Edit Alert' : 'Create New Alert'}</h4>
          
          <input
            type="text"
            placeholder="Alert Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-section">
            <label>Location</label>
            <input
              type="text"
              placeholder="City"
              value={formData.location.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: { ...formData.location, city: e.target.value }
              })}
              required
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.location.country}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: { ...formData.location, country: e.target.value }
              })}
              required
            />
            <div className="coords-inputs">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.location.coordinates.lat}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { 
                    ...formData.location, 
                    coordinates: { ...formData.location.coordinates, lat: e.target.value }
                  }
                })}
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.location.coordinates.lon}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { 
                    ...formData.location, 
                    coordinates: { ...formData.location.coordinates, lon: e.target.value }
                  }
                })}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <label>Conditions (leave empty to ignore)</label>
            <div className="condition-inputs">
              <input
                type="number"
                placeholder="Min Temperature (°C)"
                value={formData.conditions.temperatureMin}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  conditions: { ...formData.conditions, temperatureMin: e.target.value }
                })}
              />
              <input
                type="number"
                placeholder="Max Temperature (°C)"
                value={formData.conditions.temperatureMax}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  conditions: { ...formData.conditions, temperatureMax: e.target.value }
                })}
              />
              <input
                type="number"
                placeholder="Max Humidity (%)"
                value={formData.conditions.humidity}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  conditions: { ...formData.conditions, humidity: e.target.value }
                })}
              />
              <input
                type="number"
                placeholder="Max Wind Speed (m/s)"
                value={formData.conditions.windSpeed}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  conditions: { ...formData.conditions, windSpeed: e.target.value }
                })}
              />
              <input
                type="number"
                placeholder="Max AQI"
                value={formData.conditions.aqi}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  conditions: { ...formData.conditions, aqi: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="form-section">
            <label>Weather Types</label>
            <div className="weather-types">
              {['rain', 'snow', 'storm', 'fog', 'wind'].map(type => (
                <button
                  key={type}
                  type="button"
                  className={`weather-type-btn ${formData.conditions.weatherTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => handleWeatherTypeToggle(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingAlert ? 'Update Alert' : 'Create Alert'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="alerts-list">
        {loading ? (
          <p className="loading-text">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="empty-text">No alerts created yet</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className={`alert-item ${!alert.isActive ? 'inactive' : ''}`}>
              <div className="alert-info">
                <div className="alert-name">{alert.name}</div>
                <div className="alert-location">
                  {alert.location.city}, {alert.location.country}
                </div>
                <div className="alert-conditions">
                  {alert.conditions.temperatureMin && <span>Min: {alert.conditions.temperatureMin}°C</span>}
                  {alert.conditions.temperatureMax && <span>Max: {alert.conditions.temperatureMax}°C</span>}
                  {alert.conditions.weatherTypes?.length > 0 && (
                    <span>Types: {alert.conditions.weatherTypes.join(', ')}</span>
                  )}
                </div>
              </div>
              <div className="alert-actions">
                <button
                  className={`toggle-btn ${alert.isActive ? 'active' : ''}`}
                  onClick={() => handleToggleActive(alert)}
                  title={alert.isActive ? 'Disable' : 'Enable'}
                >
                  <Bell size={16} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleEdit(alert)}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(alert._id)}
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
