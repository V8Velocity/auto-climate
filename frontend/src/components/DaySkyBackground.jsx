import { useMemo } from 'react';
import './DaySkyBackground.css';

// Generate realistic layered clouds
const generateClouds = () => {
  const layers = [
    { count: 3, layer: 'far', speedRange: [80, 120], sizeRange: [1.2, 1.8], opacityRange: [0.3, 0.5] },
    { count: 4, layer: 'mid', speedRange: [50, 80], sizeRange: [0.9, 1.3], opacityRange: [0.5, 0.7] },
    { count: 3, layer: 'near', speedRange: [30, 50], sizeRange: [0.7, 1.1], opacityRange: [0.7, 0.9] },
  ];
  
  const clouds = [];
  let id = 0;
  
  layers.forEach(({ count, layer, speedRange, sizeRange, opacityRange }) => {
    for (let i = 0; i < count; i++) {
      clouds.push({
        id: id++,
        layer,
        top: `${Math.random() * 70}%`,
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        speed: Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0],
        delay: Math.random() * -100,
        opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
        variation: Math.floor(Math.random() * 3) + 1, // Cloud shape variation
      });
    }
  });
  
  return clouds;
};

// Generate atmospheric particles
const generateParticles = () => {
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.3 + 0.1,
    });
  }
  return particles;
};

export default function DaySkyBackground({ isDark }) {
  const clouds = useMemo(() => generateClouds(), []);
  const particles = useMemo(() => generateParticles(), []);

  if (isDark) return null;

  return (
    <div className="day-sky-background">
      {/* Realistic sky gradient */}
      <div className="sky-gradient-layer"></div>
      
      {/* Sun with realistic effects */}
      <div className="sun-container">
        <div className="sun">
          <div className="sun-core"></div>
          <div className="sun-corona"></div>
        </div>
        <div className="sun-rays">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)` }}></div>
          ))}
        </div>
        <div className="sun-lens-flare"></div>
      </div>
      
      {/* Atmospheric particles (dust, pollen) */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="atmospheric-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Layered realistic clouds */}
      <div className="clouds-layer">
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className={`realistic-cloud cloud-${cloud.layer} cloud-variant-${cloud.variation}`}
            style={{
              top: cloud.top,
              transform: `scale(${cloud.size})`,
              opacity: cloud.opacity,
              animationDuration: `${cloud.speed}s`,
              animationDelay: `${cloud.delay}s`,
            }}
          >
            <div className="cloud-shadow"></div>
          </div>
        ))}
      </div>
      
      {/* Light rays from sun */}
      <div className="god-rays">
        <div className="ray ray-1"></div>
        <div className="ray ray-2"></div>
        <div className="ray ray-3"></div>
      </div>
      
      {/* Atmospheric depth layers */}
      <div className="atmosphere-near"></div>
      <div className="atmosphere-far"></div>
      <div className="horizon-glow"></div>
    </div>
  );
}
