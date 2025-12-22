import { useMemo } from 'react';
import './NightSkyBackground.css';

// Generate stars outside component to avoid render issues
const generateStars = () => {
  const starCount = 150;
  const newStars = [];
  
  for (let i = 0; i < starCount; i++) {
    const brightness = Math.random();
    const size = brightness > 0.7 ? Math.random() * 2 + 2 : Math.random() * 1.5 + 0.5;
    
    newStars.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size,
      brightness,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      isBright: brightness > 0.7,
    });
  }
  
  return newStars;
};

export default function NightSkyBackground({ isDark }) {
  const stars = useMemo(() => generateStars(), []); // Generate once on mount

  if (!isDark) return null;

  return (
    <div className="night-sky-background">
      {/* Moon */}
      <div className="moon">
        {/* Moon craters for detail */}
        <div className="crater crater-1"></div>
        <div className="crater crater-2"></div>
        <div className="crater crater-3"></div>
      </div>
      
      {/* Stars */}
      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`star ${star.isBright ? 'star-bright' : ''}`}
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.brightness,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
            }}
          />
        ))}
      </div>
      
      {/* Shooting stars (occasional) */}
      <div className="shooting-star"></div>
      <div className="shooting-star" style={{ animationDelay: '7s', top: '30%', left: '70%' }}></div>
      <div className="shooting-star" style={{ animationDelay: '15s', top: '40%', left: '90%' }}></div>
      
      {/* Milky Way effect */}
      <div className="milky-way"></div>
    </div>
  );
}
