import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera, useScroll } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Suspense, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import HamburgerMenu from '../components/HamburgerMenu';
import EnvizioLoader from '../components/EnvizioLoader';
import './LandingPage.css';

function WeatherStationModel({ scrollProgress }) {
  const { scene } = useGLTF('/src/assets/weathered_workstation.glb');
  const modelRef = useRef();
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.emissive) {
          child.material.emissive = new THREE.Color(0x667eea);
          child.material.emissiveIntensity = 0.5;
        }
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame(() => {
    if (modelRef.current && scrollProgress !== undefined) {
      const progress = scrollProgress;
      modelRef.current.position.x = THREE.MathUtils.lerp(45, 0, progress);
      modelRef.current.position.y = THREE.MathUtils.lerp(-25, 0, progress);
      modelRef.current.position.z = THREE.MathUtils.lerp(-25, 0, progress);
      modelRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 0.1, progress);
    }
  });
  
  return <primitive ref={modelRef} object={scene} scale={1} position={[45, -25, -25]} />;
}

function AnimatedCamera({ scrollProgress }) {
  const cameraRef = useRef();
  
  useFrame(({ camera }) => {
    if (scrollProgress !== undefined) {
      const progress = scrollProgress;
      camera.position.x = THREE.MathUtils.lerp(-30, 0, progress);
      camera.position.y = THREE.MathUtils.lerp(-30, 2, progress);
      camera.position.z = THREE.MathUtils.lerp(20, 8, progress);
      camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
}

function ScrollManager({ onScroll }) {
  const scroll = useScroll();
  
  useFrame(() => {
    if (scroll && scroll.offset !== undefined) {
      onScroll(scroll.offset);
    }
  });
  
  return null;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();
  const { scrollYProgress } = useViewportScroll();

  useEffect(() => {
    if (loading) return;
    
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScrollProgress(latest);
    });

    return () => unsubscribe();
  }, [scrollYProgress, loading]);

  const handleCheckWeather = () => {
    navigate('/dashboard');
  };

  const handleGetLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location:', position.coords);
          navigate('/dashboard');
        },
        (error) => {
          console.error('Error getting location:', error);
          navigate('/dashboard');
        }
      );
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <EnvizioLoader onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="landing-page">
      <HamburgerMenu 
        isOpen={menuOpen} 
        onToggle={() => setMenuOpen(!menuOpen)}
        onCheckWeather={handleCheckWeather}
        onGetLocation={handleGetLocation}
      />
      
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">Auto Climate</h1>
          <p className="landing-subtitle">Interactive Weather Forecasting System</p>
        </div>

        <div className="scroll-container">
          <div className="scroll-section" data-section="start"></div>
          <div className="scroll-section" data-section="middle"></div>
          <div className="scroll-section" data-section="end"></div>
        </div>

        <div className="canvas-fixed">
          <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
              <PerspectiveCamera makeDefault position={[-30, 0, 20]} fov={45} />
              <AnimatedCamera scrollProgress={scrollProgress} />
              
              <ambientLight intensity={0.3} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1.5} 
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[-10, -10, -5]} intensity={0.5} color="#667eea" />
              <spotLight 
                position={[0, 10, 0]} 
                angle={0.3} 
                penumbra={1} 
                intensity={1}
                castShadow
                color="#764ba2"
              />
              <pointLight position={[5, 0, 5]} intensity={0.8} color="#f093fb" />

              <Suspense fallback={null}>
                <WeatherStationModel scrollProgress={scrollProgress} />
                <Environment preset="sunset" />
              </Suspense>

              <EffectComposer>
                <Bloom 
                  intensity={1.5} 
                  luminanceThreshold={0.2} 
                  luminanceSmoothing={0.9}
                  mipmapBlur
                />
                <ToneMapping />
              </EffectComposer>

              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={20}
                maxPolarAngle={Math.PI / 2}
              />
          </Canvas>
        </div>

        <motion.div 
          className="landing-instructions"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.3], [1, 0])
          }}
        >
          <p>🖱️ Click and drag to rotate • Scroll down to explore • Right-click to pan</p>
        </motion.div>

        <motion.div 
          className="screen-interface"
          style={{
            opacity: useTransform(scrollYProgress, [0.7, 1], [0, 1]),
            pointerEvents: scrollProgress > 0.7 ? 'auto' : 'none'
          }}
        >
          <div className="screen-content">
            <h2>Weather Station Interface</h2>
            <div className="screen-buttons">
              <button className="screen-btn" onClick={handleCheckWeather}>
                <span className="btn-icon">☁️</span>
                Check Weather
              </button>
              <button className="screen-btn" onClick={handleGetLocation}>
                <span className="btn-icon">📍</span>
                Get Current Location
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {!menuOpen && scrollProgress < 0.5 && (
        <motion.div 
          className="floating-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            className="cta-button"
            onClick={handleCheckWeather}
          >
            Enter Weather App →
          </button>
        </motion.div>
      )}
    </div>
  );
}
