// Robot.tsx
import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface RobotProps {
    position?: [number, number, number];
    scale?: number;
}

const Robot: React.FC<RobotProps> = ({ position = [0, 0, 0], scale = 1 }) => {
    const robotRef = useRef<THREE.Mesh>(null!);
    const { camera } = useThree(); // Access the camera to make the robot face it
    const initialY = position[1]; // Save initial Y position for bobbing

    // Load textures for the robot (using UV_1 textures as an example)
    const [
        baseColor,
        emissive,
        metallicRoughness,
        normalMap
    ] = useTexture([
        "/textures/UV_1_baseColor.png",
        "/textures/UV_1_emissive.png",
        "/textures/UV_1_metallicRoughness.png",
        "/textures/UV_1_normal.png"
    ]);

    // Animate the robot's bobbing and rotation to face the camera
    useFrame(({ clock }) => {
        if (robotRef.current) {
            // Bobbing motion
            const time = clock.getElapsedTime();
            robotRef.current.position.y = initialY + Math.sin(time * 2) * 0.2; // Adjust frequency and amplitude as needed

            // Face the camera
            robotRef.current.lookAt(camera.position);
        }
    });

    return (
        <mesh ref={robotRef} position={position} scale={scale}>
            <boxGeometry args={[1, 2, 1]} /> {/* Adjust dimensions if needed */}
            <meshStandardMaterial
                map={baseColor}                    // Base color map
                emissiveMap={emissive}             // Emissive map for glowing parts
                normalMap={normalMap}              // Normal map for surface detail
                metalnessMap={metallicRoughness}   // Metallic and roughness map
                emissiveIntensity={0.5}            // Adjust emissive intensity for glow effect
                metalness={0.8}                    // Adjust metalness for metallic look
                roughness={0.2}                    // Adjust roughness for shininess
            />
        </mesh>
    );
};

export default Robot;
