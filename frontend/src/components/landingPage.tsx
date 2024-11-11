// LandingPage.tsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import "../styles/LandingPage.css"; // Custom styles



// Earth Component without Bump Map
const Earth: React.FC = () => {
    const earthRef = useRef<THREE.Mesh>(null!);
    const cloudRef = useRef<THREE.Mesh>(null!);
  
    // Load Earth textures
    const [dayMap, specularMap, nightMap, cloudMap] = useTexture([
      "/textures/earth_daymap.jpg",    // Color map
      "/textures/earth_specular.jpg",  // Specular map
      "/textures/earth_nightmap.jpg",  // Night lights
      "/textures/earth_clouds.jpg"     // Clouds
    ]);
  
    // Rotate the Earth and clouds
    useFrame(() => {
      if (earthRef.current) earthRef.current.rotation.y += 0.001;
      if (cloudRef.current) cloudRef.current.rotation.y += 0.0015;
    });
  
    return (
      <>
        {/* Earth */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshPhongMaterial
            map={dayMap}
            specularMap={specularMap}
            shininess={15}
            emissiveMap={nightMap}
            emissiveIntensity={0.2}
            emissive={new THREE.Color(0x222222)}
          />
        </mesh>
  
        {/* Clouds */}
        <mesh ref={cloudRef}>
          <sphereGeometry args={[2.02, 64, 64]} />
          <meshPhongMaterial
            map={cloudMap}
            transparent={true}
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
  
        {/* Atmosphere */}
        <mesh>
          <sphereGeometry args={[2.06, 64, 64]} /> {/* Slightly smaller than before */}
          <meshBasicMaterial
            color="#3A9EF5"
            transparent={true}
            opacity={0.1} // Lower opacity for subtle effect
            blending={THREE.AdditiveBlending} // Additive blending for a soft glow
            side={THREE.BackSide}
          />
        </mesh>
      </>
    );
  };
  

// Hero Section Component with Dark Background
const HeroSection: React.FC = () => (

    
  <section className="hero-section">
    <div className="background-animation">
      <Canvas style={{ background: "#000" }}> {/* Deep black background */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <Earth /> {/* Display the Earth model */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="hero-content"
    >
      <h1>Effortless International Payments</h1>
      <p>Seamless, secure transactions across borders.</p>
      <a href="/signup"><button className="cta-button">Get Started</button></a>
    </motion.div>
  </section>
);

// Main Landing Page Component
const LandingPage: React.FC = () => (
  <div className="landing-page">
    <HeroSection />
  </div>
);

export default LandingPage;
