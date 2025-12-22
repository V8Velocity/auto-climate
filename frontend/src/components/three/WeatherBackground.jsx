import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Helper to generate random particles data outside of render
function generateRainParticles(count, intensity) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    velocities[i] = 0.2 + Math.random() * 0.3 * intensity;
  }
  
  return { positions, velocities };
}

function generateHeavyRainStreaks(count) {
  const positions = new Float32Array(count * 6);
  const velocities = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 60;
    const y = Math.random() * 40;
    const z = (Math.random() - 0.5) * 60;
    
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 1.5;
    positions[i * 6 + 5] = z;
    
    velocities[i] = 0.5 + Math.random() * 0.5;
  }
  
  return { positions, velocities };
}

function generateWindParticles(count, speed) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 30 - 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    
    velocities[i * 3] = (0.1 + Math.random() * 0.2) * speed;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    
    sizes[i] = Math.random() * 0.15 + 0.05;
  }
  
  return { positions, velocities, sizes };
}

function generateWindStreaks(count) {
  const positions = new Float32Array(count * 6);
  const velocities = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 80;
    const y = Math.random() * 25 - 2;
    const z = (Math.random() - 0.5) * 60;
    const length = 2 + Math.random() * 4;
    
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x + length;
    positions[i * 6 + 4] = y;
    positions[i * 6 + 5] = z;
    
    velocities[i] = 0.3 + Math.random() * 0.4;
  }
  
  return { positions, velocities };
}

function generateSnowParticles(count) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    
    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  
  return { positions, velocities };
}

function generateSunnyParticles(count) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 30 - 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  
  return { positions };
}

function generateCloudyParticles(count) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 1] = Math.random() * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  
  return { positions };
}

// Rain droplets effect
function RainParticles({ count = 2000, intensity = 1 }) {
  const mesh = useRef();
  const light = useRef();
  
  const particles = useMemo(() => generateRainParticles(count, intensity), [count, intensity]);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.velocities[i];
      
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 30;
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <pointLight ref={light} position={[0, 10, 0]} intensity={0.5} color="#4a90d9" />
      <points ref={mesh} key={`rain-${count}-${intensity}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#88ccff"
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Heavy rain with streaks
function HeavyRainStreaks({ count = 500 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => generateHeavyRainStreaks(count), [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 6 + 1] -= particles.velocities[i];
      positions[i * 6 + 4] -= particles.velocities[i];
      
      if (positions[i * 6 + 4] < -5) {
        const y = 40;
        positions[i * 6 + 1] = y;
        positions[i * 6 + 4] = y - 1.5;
        positions[i * 6] = (Math.random() - 0.5) * 60;
        positions[i * 6 + 3] = positions[i * 6];
        positions[i * 6 + 2] = (Math.random() - 0.5) * 60;
        positions[i * 6 + 5] = positions[i * 6 + 2];
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={mesh} key={`heavy-${count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#6ab7ff" transparent opacity={0.4} />
    </lineSegments>
  );
}

// Wind particles effect
function WindParticles({ count = 1500, speed = 1 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => generateWindParticles(count, speed), [count, speed]);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
      
      if (positions[i * 3] > 30) {
        positions[i * 3] = -30;
        positions[i * 3 + 1] = Math.random() * 30 - 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh} key={`wind-${count}-${speed}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#e0e8f0"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Wind streaks/lines effect
function WindStreaks({ count = 200 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => generateWindStreaks(count), [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 6] += particles.velocities[i];
      positions[i * 6 + 3] += particles.velocities[i];
      
      if (positions[i * 6] > 40) {
        const x = -40;
        const length = positions[i * 6 + 3] - positions[i * 6];
        positions[i * 6] = x;
        positions[i * 6 + 3] = x + length;
        positions[i * 6 + 1] = Math.random() * 25 - 2;
        positions[i * 6 + 4] = positions[i * 6 + 1];
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={mesh} key={`wind-streaks-${count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#b8c5d6" transparent opacity={0.3} />
    </lineSegments>
  );
}

// Snow particles
function SnowParticles({ count = 1000 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => generateSnowParticles(count), [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += Math.sin(time + i) * 0.01;
      positions[i * 3 + 1] -= particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += Math.cos(time + i) * 0.01;
      
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 30;
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh} key={`snow-${count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// Sunny floating particles
function SunnyParticles({ count = 500 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => generateSunnyParticles(count), [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime * 0.5;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.003;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh} key={`sunny-${count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffd700"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Cloudy atmosphere particles
function CloudyParticles({ count = 800 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => generateCloudyParticles(count), [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime * 0.2;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += Math.sin(time + i) * 0.005;
      positions[i * 3 + 2] += Math.cos(time + i) * 0.005;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh} key={`cloudy-${count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#a0a8b0"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// Weather scene that switches effects based on condition
function WeatherScene({ condition }) {
  const getWeatherEffect = () => {
    const weatherType = condition?.toLowerCase() || 'clear';
    
    if (weatherType.includes('rain') || weatherType.includes('drizzle') || weatherType.includes('shower')) {
      return (
        <>
          <RainParticles count={3000} intensity={1.5} />
          <HeavyRainStreaks count={400} />
          <fog attach="fog" args={['#1a1a2e', 5, 40]} />
        </>
      );
    }
    
    if (weatherType.includes('thunder') || weatherType.includes('storm')) {
      return (
        <>
          <RainParticles count={4000} intensity={2} />
          <HeavyRainStreaks count={600} />
          <WindParticles count={500} speed={1.5} />
          <fog attach="fog" args={['#0d0d1a', 3, 35]} />
        </>
      );
    }
    
    if (weatherType.includes('wind') || weatherType.includes('breez')) {
      return (
        <>
          <WindParticles count={2000} speed={1.5} />
          <WindStreaks count={300} />
          <fog attach="fog" args={['#1e2836', 10, 50]} />
        </>
      );
    }
    
    if (weatherType.includes('snow') || weatherType.includes('sleet') || weatherType.includes('blizzard')) {
      return (
        <>
          <SnowParticles count={1500} />
          <WindParticles count={500} speed={0.5} />
          <fog attach="fog" args={['#e8eef5', 5, 45]} />
        </>
      );
    }
    
    if (weatherType.includes('cloud') || weatherType.includes('overcast')) {
      return (
        <>
          <CloudyParticles count={1000} />
          <WindParticles count={300} speed={0.3} />
          <fog attach="fog" args={['#2a3040', 15, 60]} />
        </>
      );
    }
    
    if (weatherType.includes('mist') || weatherType.includes('fog') || weatherType.includes('haze')) {
      return (
        <>
          <CloudyParticles count={1500} />
          <fog attach="fog" args={['#3a4050', 3, 25]} />
        </>
      );
    }
    
    // Default: clear/sunny
    return (
      <>
        <SunnyParticles count={600} />
        <fog attach="fog" args={['#1a1a2e', 20, 80]} />
      </>
    );
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      {getWeatherEffect()}
    </>
  );
}

// Main WeatherBackground component
export default function WeatherBackground({ weatherCondition = 'clear' }) {
  return (
    <div className="weather-background-container">
      <Canvas
        camera={{ position: [0, 5, 20], fov: 60 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <WeatherScene condition={weatherCondition} />
      </Canvas>
    </div>
  );
}
