// LandingPage.tsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import "../styles/LandingPage.css";

// Import components
import Planet from "../components/purplePlanet";
import Spaceship from "../components/spaceship";
import Robot from "../components/robot";

const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null!);
  const cloudRef = useRef<THREE.Mesh>(null!);

  const [dayMap, specularMap, nightMap, cloudMap] = useTexture([
    "/textures/earth_daymap.jpg",
    "/textures/earth_specular.jpg",
    "/textures/earth_nightmap.jpg",
    "/textures/earth_clouds.jpg",
  ]);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.001;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.0015;
  });

  return (
    <>
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

      <mesh ref={cloudRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshPhongMaterial
          map={cloudMap}
          transparent={true}
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.06, 64, 64]} />
        <meshBasicMaterial
          color="#3A9EF5"
          transparent={true}
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

// InfoSection Component
const InfoSection: React.FC = () => (
  <section className="info-section">
    <div className="info-container">
      <div className="info-item">
        <h3>Global Reach</h3>
        <p>Reach international clients with ease and transact globally without hassle.</p>
      </div>
      <div className="info-item">
        <h3>Secure Transactions</h3>
        <p>We ensure top-notch security for all transactions with advanced encryption.</p>
      </div>
      <div className="info-item">
        <h3>24/7 Support</h3>
        <p>Our support team is available anytime to help with your questions.</p>
      </div>
    </div>
  </section>
);

// Footer Component
const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-container">
      <p>&copy; 2024 IntPay. All rights reserved.</p>
      <div className="footer-links">
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </footer>
);

// HeroSection Component
const HeroSection: React.FC = () => (
  <section className="hero-section">
    <div className="background-animation">
      <Canvas style={{ background: "#000" }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <Earth />
        <Planet position={[10, 0, -5]} scale={0.6} />
        <Spaceship position={[15, 5, -10]} scale={0.3} />
        <Robot position={[5, -2, -8]} scale={1} />
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
    {/* Include InfoSection and Footer here */}
    <InfoSection />
    <Footer />
  </section>
);

// Main Landing Page Component
const LandingPage: React.FC = () => (
  <div className="landing-page">
    <HeroSection />
  </div>
);

export default LandingPage;
