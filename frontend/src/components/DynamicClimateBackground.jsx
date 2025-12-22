import { useEffect, useRef, useState, useMemo } from 'react';
import clsx from 'clsx';

// Seeded random function for consistent results
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ========================================
// VANTA CLOUDS EFFECT (Day Mode)
// ========================================
function VantaCloudsBackground({ children }) {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const [vantaLoaded, setVantaLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadVanta = async () => {
      try {
        // Dynamic imports
        const THREE = await import('three');
        const VANTA = await import('vanta/dist/vanta.clouds.min');
        
        if (mounted && vantaRef.current && !vantaEffect.current) {
          vantaEffect.current = VANTA.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            backgroundColor: 0x1a9fd4,
            skyColor: 0x4eb4e6,
            cloudColor: 0xc9e8f5,
            cloudShadowColor: 0x2d5a7b,
            sunColor: 0xffcc00,
            sunGlareColor: 0xff8833,
            sunlightColor: 0xffaa44,
            speed: 1.2,
          });
          setVantaLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Vanta Clouds:', error);
        if (mounted) setVantaLoaded(true); // Show fallback
      }
    };

    loadVanta();

    return () => {
      mounted = false;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (vantaEffect.current) {
        vantaEffect.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={vantaRef}
      className={clsx(
        'fixed inset-0 w-screen h-screen',
        'transition-opacity duration-1000',
        vantaLoaded ? 'opacity-100' : 'opacity-0'
      )}
      style={{ zIndex: -1, top: 0, left: 0, margin: 0, padding: 0 }}
    >
      {!vantaLoaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500 via-sky-400 to-sky-300" />
      )}
      {children}
    </div>
  );
}

// ========================================
// AURORA BOREALIS EFFECT (Night Mode)
// ========================================
function AuroraBackground({ children }) {
  // Generate stars using useMemo to avoid re-calculation on render
  const stars = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${seededRandom(i * 1.1) * 100}%`,
      top: `${seededRandom(i * 2.2) * 60}%`,
      size: seededRandom(i * 3.3) * 2 + 1,
      delay: seededRandom(i * 4.4) * 3,
      duration: 2 + seededRandom(i * 5.5) * 2,
    }))
  , []);

  return (
    <div
      className={clsx(
        'fixed inset-0 w-screen h-screen overflow-hidden',
        'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950'
      )}
      style={{ zIndex: -1, top: 0, left: 0, margin: 0, padding: 0 }}
    >
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950" />

      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Aurora Layer 1 - Green */}
      <div className="absolute inset-x-0 top-0 h-[70vh] animate-[aurora-wave_8s_ease-in-out_infinite]">
        <div
          className="absolute inset-0 bg-gradient-to-b from-emerald-500/40 via-emerald-400/20 to-transparent blur-3xl"
          style={{
            clipPath: 'polygon(0% 0%, 15% 50%, 30% 20%, 45% 60%, 60% 30%, 75% 70%, 90% 40%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        />
      </div>

      {/* Aurora Layer 2 - Purple */}
      <div className="absolute inset-x-0 top-10 h-[60vh] animate-[aurora-wave_10s_ease-in-out_infinite_1s]">
        <div
          className="absolute inset-0 bg-gradient-to-b from-purple-500/50 via-fuchsia-400/25 to-transparent blur-3xl"
          style={{
            clipPath: 'polygon(0% 20%, 20% 40%, 35% 15%, 50% 50%, 65% 25%, 80% 55%, 95% 30%, 100% 20%, 100% 100%, 0% 100%)',
          }}
        />
      </div>

      {/* Aurora Layer 3 - Blue */}
      <div className="absolute inset-x-0 top-20 h-[50vh] animate-[aurora-wave_12s_ease-in-out_infinite_2s]">
        <div
          className="absolute inset-0 bg-gradient-to-b from-blue-500/35 via-cyan-400/20 to-transparent blur-3xl"
          style={{
            clipPath: 'polygon(5% 10%, 25% 45%, 40% 20%, 55% 55%, 70% 30%, 85% 60%, 100% 10%, 100% 100%, 0% 100%)',
          }}
        />
      </div>

      {/* Moon */}
      <div className="absolute top-16 right-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-slate-200 shadow-[0_0_40px_15px_rgba(255,255,255,0.2)]" />
          <div className="absolute top-2 left-3 w-4 h-4 rounded-full bg-slate-300/50" />
          <div className="absolute bottom-3 right-4 w-3 h-3 rounded-full bg-slate-300/40" />
        </div>
      </div>

      {/* Glow at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-indigo-900/50 via-purple-900/20 to-transparent" />

      {children}
    </div>
  );
}

// ========================================
// RAIN EFFECT
// ========================================
function RainBackground({ children }) {
  const raindrops = useMemo(() =>
    Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${seededRandom(i * 1.5) * 100}%`,
      delay: seededRandom(i * 2.5) * 2,
      duration: 0.5 + seededRandom(i * 3.5) * 0.5,
      height: 15 + seededRandom(i * 4.5) * 20,
    }))
  , []);

  return (
    <div
      className={clsx(
        'fixed inset-0 w-screen h-screen overflow-hidden',
        'bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500'
      )}
      style={{ zIndex: -1 }}
    >
      {/* Rain cloud overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-800/80 via-slate-700/60 to-transparent" />

      {/* Raindrops */}
      <div className="absolute inset-0">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-300/60 to-blue-400/80 animate-[rain_linear_infinite]"
            style={{
              left: drop.left,
              height: drop.height,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Mist at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-400/50 to-transparent blur-xl" />

      {children}
    </div>
  );
}

// ========================================
// STORM EFFECT
// ========================================
function StormBackground({ children }) {
  const [lightning, setLightning] = useState(false);

  useEffect(() => {
    const triggerLightning = () => {
      setLightning(true);
      setTimeout(() => setLightning(false), 150);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerLightning();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const raindrops = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => ({
      id: i,
      left: `${seededRandom(i * 1.2) * 100}%`,
      delay: seededRandom(i * 2.2) * 1,
      duration: 0.3 + seededRandom(i * 3.2) * 0.3,
      height: 20 + seededRandom(i * 4.2) * 25,
    }))
  , []);

  return (
    <div
      className={clsx(
        'fixed inset-0 w-screen h-screen overflow-hidden transition-all duration-100',
        lightning 
          ? 'bg-gradient-to-b from-slate-100 via-slate-300 to-slate-500' 
          : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700'
      )}
      style={{ zIndex: -1 }}
    >
      {/* Storm overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-950/90 via-slate-800/70 to-transparent" />

      {/* Heavy rain */}
      <div className="absolute inset-0">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-[2px] bg-gradient-to-b from-transparent via-slate-400/50 to-slate-300/70 animate-[rain_linear_infinite]"
            style={{
              left: drop.left,
              height: drop.height,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
            }}
          />
        ))}
      </div>

      {children}
    </div>
  );
}

// ========================================
// SNOW EFFECT
// ========================================
function SnowBackground({ children }) {
  const snowflakes = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${seededRandom(i * 1.3) * 100}%`,
      delay: seededRandom(i * 2.3) * 5,
      duration: 5 + seededRandom(i * 3.3) * 5,
      size: 2 + seededRandom(i * 4.3) * 4,
      wobble: seededRandom(i * 5.3) * 30 - 15,
    }))
  , []);

  return (
    <div
      className={clsx(
        'fixed inset-0 w-screen h-screen overflow-hidden',
        'bg-gradient-to-b from-slate-300 via-slate-200 to-slate-100'
      )}
      style={{ zIndex: -1 }}
    >
      {/* Snow glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/50 via-slate-200/30 to-transparent" />

      {/* Snowflakes */}
      <div className="absolute inset-0">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute rounded-full bg-white shadow-sm animate-[snow_linear_infinite]"
            style={{
              left: flake.left,
              width: flake.size,
              height: flake.size,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Ground snow */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent" />

      {children}
    </div>
  );
}

// ========================================
// FOGGY EFFECT
// ========================================
function FoggyBackground({ children }) {
  return (
    <div
      className={clsx(
        'fixed inset-0 w-screen h-screen overflow-hidden',
        'bg-gradient-to-b from-slate-400 via-slate-300 to-slate-200'
      )}
      style={{ zIndex: -1 }}
    >
      {/* Fog layers */}
      <div className="absolute inset-0 animate-[fog_20s_ease-in-out_infinite]">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-300/80 via-white/60 to-slate-300/80 blur-3xl" />
      </div>

      <div className="absolute inset-0 animate-[fog_25s_ease-in-out_infinite_5s]">
        <div className="absolute top-1/4 inset-x-0 h-1/2 bg-gradient-to-r from-white/70 via-slate-200/50 to-white/70 blur-[80px]" />
      </div>

      <div className="absolute inset-0 animate-[fog_30s_ease-in-out_infinite_10s]">
        <div className="absolute top-1/3 inset-x-0 h-1/3 bg-gradient-to-r from-slate-200/60 via-white/80 to-slate-200/60 blur-[60px]" />
      </div>

      {/* Ground fog */}
      <div className="absolute bottom-0 inset-x-0 h-48">
        <div className="w-full h-full bg-gradient-to-t from-white/90 to-transparent blur-xl" />
      </div>

      {children}
    </div>
  );
}

// ========================================
// MAIN WRAPPER COMPONENT
// ========================================
export default function DynamicClimateBackground({ condition = 'day', children }) {
  const renderBackground = () => {
    switch (condition) {
      case 'night':
        return <AuroraBackground>{children}</AuroraBackground>;
      case 'rain':
        return <RainBackground>{children}</RainBackground>;
      case 'storm':
        return <StormBackground>{children}</StormBackground>;
      case 'snow':
        return <SnowBackground>{children}</SnowBackground>;
      case 'fog':
        return <FoggyBackground>{children}</FoggyBackground>;
      case 'day':
      default:
        return <VantaCloudsBackground>{children}</VantaCloudsBackground>;
    }
  };

  return renderBackground();
}
