import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    console.log('[useGeolocation] getLocation called');
    
    if (!navigator.geolocation) {
      console.error('[useGeolocation] Geolocation not supported');
      setError('Geolocation is not supported by your browser');
      return;
    }

    console.log('[useGeolocation] Starting geolocation request...');
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[useGeolocation] Success! Position:', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        console.error('[useGeolocation] Error:', err.message, err.code);
        console.error('[useGeolocation] Error details:', err);
        
        // If high accuracy times out, try again with lower accuracy
        if (err.code === 3) {
          console.log('[useGeolocation] Timeout with high accuracy, retrying with lower accuracy...');
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('[useGeolocation] Success with lower accuracy! Position:', {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
              setLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
              setLoading(false);
            },
            (retryErr) => {
              console.error('[useGeolocation] Retry also failed:', retryErr.message);
              setError(retryErr.message);
              setLoading(false);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 300000
            }
          );
        } else {
          setError(err.message);
          setLoading(false);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
        ...options
      }
    );
  };

  const watchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );

    return watchId;
  };

  const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  return {
    location,
    error,
    loading,
    getLocation,
    watchLocation,
    clearWatch
  };
};
