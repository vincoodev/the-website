/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL STARS - Massive Star Field
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Thousands of instanced stars
 * - Size and brightness variation
 * - Twinkling animation
 * - Depth-based fog
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const starVertexShader = `
    attribute float size;
    attribute float brightness;
    attribute float twinkleSpeed;
    attribute float twinkleOffset;
    
    uniform float uTime;
    uniform float uPixelRatio;
    
    varying float vBrightness;
    
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Twinkle effect
        float twinkle = sin(uTime * twinkleSpeed + twinkleOffset) * 0.5 + 0.5;
        vBrightness = brightness * (0.7 + twinkle * 0.3);
        
        // Size attenuation
        gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.0, 20.0);
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const starFragmentShader = `
    uniform vec3 uColor;
    varying float vBrightness;
    
    void main() {
        // Circular star shape with soft edges
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // Soft glow
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= vBrightness;
        
        // Core is brighter
        float core = 1.0 - smoothstep(0.0, 0.2, dist);
        
        vec3 color = uColor * (1.0 + core * 0.5);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

export default function ProceduralStars({
    count = 5000,
    radius = 100,
    color = '#ffffff',
    minSize = 1,
    maxSize = 4
}) {
    const pointsRef = useRef();

    const { positions, sizes, brightnesses, twinkleSpeeds, twinkleOffsets } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const brightnesses = new Float32Array(count);
        const twinkleSpeeds = new Float32Array(count);
        const twinkleOffsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.3 + Math.random() * 0.7); // Vary distance

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Random properties
            sizes[i] = minSize + Math.random() * (maxSize - minSize);
            brightnesses[i] = 0.3 + Math.random() * 0.7;
            twinkleSpeeds[i] = 0.5 + Math.random() * 2.0;
            twinkleOffsets[i] = Math.random() * Math.PI * 2;
        }

        return { positions, sizes, brightnesses, twinkleSpeeds, twinkleOffsets };
    }, [count, radius, minSize, maxSize]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    }), [color]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-brightness"
                    count={count}
                    array={brightnesses}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-twinkleSpeed"
                    count={count}
                    array={twinkleSpeeds}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-twinkleOffset"
                    count={count}
                    array={twinkleOffsets}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={starVertexShader}
                fragmentShader={starFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
