// Spaceship.tsx
import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface SpaceshipProps {
    position?: [number, number, number];
    scale?: number;
}

const Spaceship: React.FC<SpaceshipProps> = ({ position = [0, 0, 0], scale = 1 }) => {
    const spaceshipRef = useRef<THREE.Mesh>(null!);

    // Load textures for the spaceship
    const [diffuse, emissive, normalMap, occlusion, specularGlossiness] = useTexture([
        "/textures/Material_34_diffuse.png",
        "/textures/Material_34_emissive.png",
        "/textures/Material_34_normal.png",
        "/textures/Material_34_occlusion.png",
        "/textures/Material_34_specularGlossiness.png",
    ]);

    // State to control the spaceship's random movement direction and speed
    const [direction, setDirection] = useState(new THREE.Vector3());
    const [speed, setSpeed] = useState(0.02);

    // Randomly set direction and speed every few seconds
    useEffect(() => {
        const changeDirection = () => {
            // Randomize direction vector components
            const randomDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2, // x-axis direction (-1 to 1)
                (Math.random() - 0.5) * 2, // y-axis direction (-1 to 1)
                (Math.random() - 0.5) * 2  // z-axis direction (-1 to 1)
            ).normalize();

            setDirection(randomDirection);
            setSpeed(0.01 + Math.random() * 0.03); // Random speed between 0.01 and 0.04
        };

        // Set initial random direction and speed
        changeDirection();

        // Change direction every 3 to 5 seconds
        const interval = setInterval(changeDirection, 3000 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, []);

    // Move the spaceship in the current direction
    useFrame(() => {
        if (spaceshipRef.current) {
            spaceshipRef.current.position.add(direction.clone().multiplyScalar(speed));
            
            // Optional: Reset position if it moves too far from the center
            const distanceFromCenter = spaceshipRef.current.position.length();
            if (distanceFromCenter > 30) {
                spaceshipRef.current.position.set(0, 0, 0); // Reset to origin
            }
        }
    });

    return (
        <mesh ref={spaceshipRef} position={position} scale={scale}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                map={diffuse}                 // Base color map
                emissiveMap={emissive}        // Emission map for glowing effects
                normalMap={normalMap}         // Normal map for surface detail
                aoMap={occlusion}             // Ambient occlusion for shadow detail
                metalnessMap={specularGlossiness} // Specular map for reflections
                metalness={0.5}               // Adjust metalness
                roughness={0.5}               // Adjust roughness
            />
        </mesh>
    );
};

export default Spaceship;
