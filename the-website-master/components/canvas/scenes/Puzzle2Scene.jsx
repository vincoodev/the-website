/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUZZLE 2 SCENE - COSMIC AETHER (STABLE 2D-STYLE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * High-performance, crash-proof implementation of the requested features:
 * 🌠 Shooting Stars (Active, Diagonal)
 * ✨ Sacred Light Beams (Swaying, Additive)
 * 🌌 Custom Glowing Point Particles (Replaces Stars)
 * 🔮 Brighter Nebula (Volumetric)
 * 
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Version: 2.0 (Stable 2D-Style)
 */

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Premium materials & Effects
import CustomBloom from '../effects/CustomBloom';
import Vignette3D from '../effects/Vignette3D';

/* ─── GLOWING STAR PARTICLES (Custom System) ─── */
function GlowingParticles({ count = 3000 }) {
    // Generate random positions and sizes
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count); // Random blink speeds

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // Spread wide and deep
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 100 - 50; // Background depth

            sizes[i] = Math.random() < 0.9 ? Math.random() * 0.5 : Math.random() * 1.5; // Mix of tiny and large stars
            speeds[i] = 0.5 + Math.random() * 2.0;
        }
        return { positions, sizes, speeds };
    }, [count]);

    // Custom Shader for Twinkling Light Particles
    const shader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#ffffff') } // Pure White (No Blue)
        },
        vertexShader: `
            uniform float uTime;
            attribute float aSize;
            attribute float aSpeed;
            varying float vAlpha;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Twinkle logic
                float twinkle = sin(uTime * aSpeed + position.x * 10.0) * 0.5 + 0.5;
                vAlpha = 0.5 + twinkle * 0.5; // Base opacity + twinkle

                // Size attenuation
                gl_PointSize = aSize * (300.0 / -mvPosition.z);
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            void main() {
                // Circular soft particle
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                
                // Glow gradient
                float glow = 1.0 - (r * 2.0);
                glow = pow(glow, 2.0); // Sharpen glow

                gl_FragColor = vec4(uColor, vAlpha * glow);
            }
        `
    }), []);

    const materialRef = useRef();
    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={particles.sizes.length}
                    array={particles.sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aSpeed"
                    count={particles.speeds.length}
                    array={particles.speeds}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                args={[shader]}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── SHOOTING STAR (Self-Recycling 2D Logic) ─── */
function ShootingStar() {
    const ref = useRef();

    // Internal state for recycling without re-renders
    const state = useRef({
        active: false,
        speed: 0,
        delay: 0
    });

    const reset = useCallback(() => {
        if (!ref.current) return;

        // Randomize parameters
        state.current.active = false;
        state.current.delay = Math.random() * 3 + 1; // 1-4s delay (More frequent)

        // Hide
        ref.current.scale.set(0, 0, 0);

        // Schedule activation
        setTimeout(() => {
            if (!ref.current) return;
            state.current.active = true;
            state.current.speed = 50 + Math.random() * 30; // Faster

            // Set Start Position
            const startX = (Math.random() - 0.5) * 100;
            const startY = 40 + Math.random() * 10;
            ref.current.position.set(startX, startY, -20);
            ref.current.rotation.z = -Math.PI / 4;
            ref.current.scale.set(1, 1, 1);
        }, state.current.delay * 1000);
    }, []);

    // Initial start
    useEffect(() => {
        reset();
    }, [reset]);

    useFrame((_, delta) => {
        if (!ref.current || !state.current.active) return;

        // Animate
        ref.current.position.x += state.current.speed * delta;
        ref.current.position.y -= state.current.speed * delta; // Steep diagonal

        // Check bounds (recycle)
        if (ref.current.position.y < -50) {
            reset();
        }
    });

    return (
        <mesh ref={ref}>
            <planeGeometry args={[8, 0.15]} /> {/* Long clean trail */}
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

function ShootingStarsSystem({ count = 15 }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <ShootingStar key={i} />
            ))}
        </group>
    );
}

export default function Puzzle2Scene({ status }) {
    return (
        <>
            {/* Fixed Frontal Camera */}
            <color attach="background" args={['#000000']} /> {/* Pure Svant Black */}

            {/* 1. Only Glowing Particles (The Stars) */}
            <GlowingParticles count={6000} />

            {/* 2. Only Shooting Stars */}
            <ShootingStarsSystem count={15} />

            {/* Post Processing for High Quality Light Glow */}
            <CustomBloom
                intensity={3.0} // Strong glow for the particles
                luminanceThreshold={0.1}
                luminanceSmoothing={0.9}
            />

            {/* Minimal overlays for cinematic feel */}
            <Vignette3D darkness={0.4} />
        </>
    );
}
