import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#00f0ff"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#00f0ff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
};

const AlertParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#d900ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

const DashboardText = () => {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#00f0ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        AI MONITORING
      </Text>
    </Float>
  );
};

const HolographicDashboard = () => {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border-2 border-primary/30 glass-card">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#d900ff" />
          
          <AnimatedSphere />
          <AlertParticles />
          <DashboardText />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        <div className="glass-surface px-4 py-2 rounded-lg border border-primary/30">
          <p className="text-xs text-muted-foreground">Live Status</p>
          <p className="text-sm font-bold text-success">All Systems Operational</p>
        </div>
        <div className="glass-surface px-4 py-2 rounded-lg border border-accent/30">
          <p className="text-xs text-muted-foreground">AI Confidence</p>
          <p className="text-sm font-bold text-accent">98.7%</p>
        </div>
      </div>
    </div>
  );
};

export default HolographicDashboard;
