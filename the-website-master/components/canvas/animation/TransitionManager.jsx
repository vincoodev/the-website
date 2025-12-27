/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRANSITION MANAGER - Scene Transitions
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Smooth scene transition effects:
 * - Fade in/out
 * - Wipe effects
 * - Dissolve patterns
 * - Flash transitions
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── FADE TRANSITION ─── */
export function FadeTransition({
    active = false,
    color = '#000000',
    duration = 1.0,
    onComplete = () => { }
}) {
    const meshRef = useRef();
    const { viewport } = useThree();
    const progress = useRef(active ? 0 : 1);
    const direction = useRef(active ? 1 : -1);

    useEffect(() => {
        direction.current = active ? 1 : -1;
    }, [active]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        progress.current += direction.current * (delta / duration);
        progress.current = THREE.MathUtils.clamp(progress.current, 0, 1);

        meshRef.current.material.opacity = progress.current;

        if ((active && progress.current >= 1) || (!active && progress.current <= 0)) {
            onComplete();
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 5]} renderOrder={9999}>
            <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
            <meshBasicMaterial
                color={color}
                transparent={true}
                opacity={0}
                depthTest={false}
            />
        </mesh>
    );
}

/* ─── FLASH TRANSITION ─── */
export function FlashTransition({
    active = false,
    color = '#ffffff',
    duration = 0.3
}) {
    const meshRef = useRef();
    const { viewport } = useThree();
    const progress = useRef(0);

    useEffect(() => {
        if (active) {
            progress.current = 1;
        }
    }, [active]);

    useFrame((_, delta) => {
        if (!meshRef.current || progress.current <= 0) return;

        progress.current -= delta / duration;
        progress.current = Math.max(0, progress.current);

        meshRef.current.material.opacity = progress.current;
    });

    if (progress.current <= 0 && !active) return null;

    return (
        <mesh ref={meshRef} position={[0, 0, 5]} renderOrder={9999}>
            <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
            <meshBasicMaterial
                color={color}
                transparent={true}
                opacity={1}
                depthTest={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

/* ─── WIPE TRANSITION ─── */
export function WipeTransition({
    active = false,
    color = '#000000',
    direction = 'left', // left, right, up, down
    duration = 0.8
}) {
    const meshRef = useRef();
    const { viewport } = useThree();
    const progress = useRef(active ? 0 : 1);

    const uniforms = useMemo(() => ({
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uDirection: { value: direction === 'left' || direction === 'right' ? 0 : 1 },
        uReverse: { value: direction === 'right' || direction === 'down' },
    }), [color, direction]);

    const shaderMaterial = useMemo(() => ({
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uProgress;
            uniform vec3 uColor;
            uniform float uDirection;
            uniform bool uReverse;
            varying vec2 vUv;
            
            void main() {
                float coord = uDirection > 0.5 ? vUv.y : vUv.x;
                if (uReverse) coord = 1.0 - coord;
                
                float alpha = step(coord, uProgress);
                
                gl_FragColor = vec4(uColor, alpha);
            }
        `
    }), []);

    useEffect(() => {
        progress.current = active ? 0 : 1;
    }, [active]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        const target = active ? 1 : 0;
        const speed = delta / duration;

        if (active) {
            progress.current = Math.min(progress.current + speed, 1);
        } else {
            progress.current = Math.max(progress.current - speed, 0);
        }

        meshRef.current.material.uniforms.uProgress.value = progress.current;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 5]} renderOrder={9998}>
            <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={shaderMaterial.vertexShader}
                fragmentShader={shaderMaterial.fragmentShader}
                transparent={true}
                depthTest={false}
            />
        </mesh>
    );
}

/* ─── DIVINE REVEAL TRANSITION ─── */
export function DivineReveal({
    active = false,
    duration = 1.5
}) {
    const meshRef = useRef();
    const { viewport } = useThree();
    const progress = useRef(0);

    const uniforms = useMemo(() => ({
        uProgress: { value: 0 },
        uTime: { value: 0 },
    }), []);

    useEffect(() => {
        if (active) {
            progress.current = 0;
        }
    }, [active]);

    useFrame(({ clock }, delta) => {
        if (!meshRef.current) return;

        if (active && progress.current < 1) {
            progress.current += delta / duration;
            progress.current = Math.min(progress.current, 1);
        }

        meshRef.current.material.uniforms.uProgress.value = progress.current;
        meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    });

    const fragmentShader = `
        uniform float uProgress;
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = length(vUv - center);
            
            // Radial reveal from center
            float reveal = smoothstep(uProgress * 1.5, uProgress * 1.5 - 0.1, dist);
            
            // Golden glow at edge
            float edge = smoothstep(uProgress * 1.5 - 0.15, uProgress * 1.5 - 0.05, dist) -
                        smoothstep(uProgress * 1.5 - 0.05, uProgress * 1.5, dist);
            
            vec3 goldColor = vec3(1.0, 0.85, 0.4);
            vec3 color = mix(vec3(0.0), goldColor, edge);
            
            float alpha = reveal * (1.0 - uProgress);
            alpha += edge * 2.0;
            
            gl_FragColor = vec4(color, alpha);
        }
    `;

    if (!active && progress.current >= 1) return null;

    return (
        <mesh ref={meshRef} position={[0, 0, 4.9]} renderOrder={9997}>
            <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={fragmentShader}
                transparent={true}
                depthTest={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

export default FadeTransition;
