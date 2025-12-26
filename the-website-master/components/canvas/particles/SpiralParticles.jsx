/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SPIRAL PARTICLES - Omega Reveal Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Dramatic spiral animation:
 * - Particles spiral toward center
 * - Golden divine trail
 * - Reveal/summon effect
 * - Configurable direction
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── SPIRAL SHADER ─── */
const spiralVertexShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uRadius;
    uniform float uHeight;
    uniform bool uInward;
    
    attribute float aPhase;
    attribute float aSpeed;
    
    varying float vProgress;
    
    void main() {
        float progress = mod(uTime * aSpeed + aPhase, 1.0);
        vProgress = progress;
        
        // Spiral calculation
        float angle = progress * 3.14159 * 6.0 + aPhase * 3.14159 * 2.0;
        float radius = uInward ? uRadius * (1.0 - progress) : uRadius * progress;
        float height = uHeight * (uInward ? progress : 1.0 - progress);
        
        vec3 pos;
        pos.x = position.x + cos(angle) * radius;
        pos.y = position.y + height;
        pos.z = position.z + sin(angle) * radius;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size decreases as particle approaches center
        float size = uInward ? (1.0 - progress) : progress;
        gl_PointSize = 4.0 * size * (200.0 / -mvPosition.z);
    }
`;

const spiralFragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    
    varying float vProgress;
    
    void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        float alpha = glow * uOpacity * (1.0 - vProgress * 0.5);
        
        gl_FragColor = vec4(uColor, alpha);
    }
`;

export default function SpiralParticles({
    count = 200,
    position = [0, 0, 0],
    color = '#ffd700',
    radius = 5,
    height = 3,
    speed = 0.3,
    inward = true,
    opacity = 1.0
}) {
    const pointsRef = useRef();

    const { positions, phases, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            phases[i] = Math.random();
            speeds[i] = speed * (0.5 + Math.random());
        }

        return { positions, phases, speeds };
    }, [count, speed]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSpeed: { value: speed },
        uRadius: { value: radius },
        uHeight: { value: height },
        uInward: { value: inward },
        uOpacity: { value: opacity },
    }), [color, speed, radius, height, inward, opacity]);

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
                    attach="attributes-aSpeed"
                    count={count}
                    array={speeds}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={spiralVertexShader}
                fragmentShader={spiralFragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── OMEGA REVEAL SPIRAL ─── */
export function OmegaRevealSpiral({ active = true, position = [0, 0, 0] }) {
    if (!active) return null;

    return (
        <>
            <SpiralParticles
                count={300}
                position={position}
                color="#ffd700"
                radius={6}
                height={4}
                speed={0.4}
                inward={true}
            />
            <SpiralParticles
                count={200}
                position={position}
                color="#ffffff"
                radius={4}
                height={3}
                speed={0.6}
                inward={true}
            />
        </>
    );
}

/* ─── SUMMON EFFECT ─── */
export function SummonEffect({ position = [0, 0, 0] }) {
    return (
        <>
            <SpiralParticles
                count={200}
                position={position}
                color="#9966ff"
                radius={4}
                height={5}
                speed={0.5}
                inward={false}
            />
            <SpiralParticles
                count={150}
                position={position}
                color="#ff66cc"
                radius={3}
                height={4}
                speed={-0.3}
                inward={true}
            />
        </>
    );
}

export { spiralVertexShader, spiralFragmentShader };
