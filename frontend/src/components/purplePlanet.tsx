// Planet.tsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface PlanetProps {
    position?: [number, number, number];
    scale?: number;
}

const Planet: React.FC<PlanetProps> = ({ position = [0, 0, 0], scale = 1 }) => {
    const planetRef = useRef<THREE.Mesh>(null!);
    const cloudRef = useRef<THREE.Mesh>(null!);

    // Load all necessary textures for Purple Planet
    const [baseColor, metallicRoughness, normalMap, cloudBaseColor, cloudNormal] = useTexture([
        "/textures/PurplePlanet_baseColor.png",
        "/textures/PurplePlanet_metallicRoughness.png",
        "/textures/PurplePlanet_normal.png",
        "/textures/Clouds_0_baseColor.png",  // Cloud color map
        "/textures/Clouds_0_normal.png",     // Cloud normal map
    ]);

    // Rotate the planet and clouds slowly
    useFrame(() => {
        if (planetRef.current) planetRef.current.rotation.y += 0.001;
        if (cloudRef.current) cloudRef.current.rotation.y += 0.0015;
    });

    return (
        <>
            {/* Main Planet Sphere */}
            <Sphere ref={planetRef} args={[1, 64, 64]} position={position} scale={scale}>
                <meshStandardMaterial
                    map={baseColor}               // Base color map
                    metalnessMap={metallicRoughness}  // Metallic and roughness map
                    normalMap={normalMap}          // Normal map
                    metalness={0.5}                // Adjust metalness if needed
                    roughness={0.5}                // Adjust roughness if needed
                    color={"#7b3f9b"}              // Overlay purple color
                    emissive={new THREE.Color("#501a7b")}  // Add a purple glow
                    emissiveIntensity={0.3}       // Adjust intensity of the purple glow
                />
            </Sphere>

            {/* Cloud Layer Sphere */}
            <Sphere ref={cloudRef} args={[1.02, 64, 64]} position={position} scale={scale}>
                <meshStandardMaterial
                    map={cloudBaseColor}           // Cloud base color map
                    normalMap={cloudNormal}        // Cloud normal map
                    transparent={true}             // Make clouds partially transparent
                    opacity={0.6}                  // Adjust opacity for a subtle cloud effect
                    depthWrite={false}             // Prevent depth conflicts with the planet
                />
            </Sphere>
        </>
    );
};

export default Planet;
