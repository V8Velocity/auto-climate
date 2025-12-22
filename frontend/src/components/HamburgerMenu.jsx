import { MapPin, Cloud, X } from 'lucide-react';
import './HamburgerMenu.css';

export default function HamburgerMenu({ isOpen, onToggle, onCheckWeather, onGetLocation }) {
  return (
    <>
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`menu-overlay ${isOpen ? 'active' : ''}`}>
        <button className="menu-close" onClick={onToggle}>
          <X size={32} />
        </button>

        <div className="menu-content">
          <h2 className="menu-title">Weather Station</h2>
          <p className="menu-description">Choose an option to get started</p>

          <div className="menu-options">
            <button className="menu-option" onClick={onCheckWeather}>
              <div className="option-icon">
                <Cloud size={40} />
              </div>
              <div className="option-text">
                <h3>Check Weather</h3>
                <p>View current weather conditions and forecasts</p>
              </div>
            </button>

            <button className="menu-option" onClick={onGetLocation}>
              <div className="option-icon">
                <MapPin size={40} />
              </div>
              <div className="option-text">
                <h3>Get Current Location Weather</h3>
                <p>Automatically detect your location and show weather</p>
              </div>
            </button>
          </div>

          <div className="menu-footer">
            <p>Interact with the 3D model using your mouse</p>
          </div>
        </div>
      </div>
    </>
  );
}
