/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAGIC DUST - Divine Sparkle Particles
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ethereal dust effect:
 * - Slow floating motion
 * - Twinkling brightness
 * - Golden divine glow
 * - Soft fade edges
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── MAGIC DUST SHADER ─── */
const dustVertexShader = `
    uniform float uTime;
    uniform float uSize;
    
    attribute float aPhase;
    attribute float aTwinkleSpeed;
    
    varying float vTwinkle;
    
    void main() {
        // Floating motion
        vec3 pos = position;
        pos.y += sin(uTime * 0.5 + aPhase) * 0.3;
        pos.x += cos(uTime * 0.3 + aPhase * 2.0) * 0.2;
        pos.z += sin(uTime * 0.4 + aPhase * 1.5) * 0.2;
        
        // Twinkling
        vTwinkle = sin(uTime * aTwinkleSpeed + aPhase * 10.0) * 0.5 + 0.5;
        vTwinkle = pow(vTwinkle, 2.0);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size with twinkle
        gl_PointSize = uSize * (1.0 + vTwinkle * 0.5) * (200.0 / -mvPosition.z);
    }
`;

const dustFragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    
    varying float vTwinkle;
    
    void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        // Soft glow
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 1.5);
        
        float alpha = glow * uOpacity * (0.5 + vTwinkle * 0.5);
        
        // Brighter center
        vec3 color = uColor + vec3(vTwinkle * 0.3);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

export default function MagicDust({
    count = 200,
    spread = [10, 5, 10],
    position = [0, 0, 0],
    color = '#ffd700',
    size = 3.0,
    opacity = 0.8
}) {
    const pointsRef = useRef();

    const { positions, phases, twinkleSpeeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const twinkleSpeeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread[0];
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2];

            phases[i] = Math.random() * Math.PI * 2;
            twinkleSpeeds[i] = 2 + Math.random() * 4;
        }

        return { positions, phases, twinkleSpeeds };
    }, [count, spread]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size },
        uOpacity: { value: opacity },
    }), [color, size, opacity]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aPhase"
                    count={count}
                    array={phases}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aTwinkleSpeed"
                    count={count}
                    array={twinkleSpeeds}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={dustVertexShader}
                fragmentShader={dustFragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── DIVINE DUST ─── */
export function DivineDust({ position = [0, 2, 0] }) {
    return (
        <MagicDust
            count={300}
            spread={[15, 8, 15]}
            position={position}
            color="#ffd700"
            size={4.0}
            opacity={0.9}
        />
    );
}

/* ─── COSMIC DUST ─── */
export function CosmicDust({ position = [0, 0, 0] }) {
    return (
        <MagicDust
            count={500}
            spread={[20, 10, 20]}
            position={position}
            color="#9966ff"
            size={2.5}
            opacity={0.7}
        />
    );
}

export { dustVertexShader, dustFragmentShader };
