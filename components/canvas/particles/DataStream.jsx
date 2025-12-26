/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA STREAM - Matrix Digital Rain 3D
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Cyberpunk data visualization:
 * - Falling data particles
 * - Character-like points
 * - Trail effect
 * - Green terminal glow
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── DATA STREAM SHADER ─── */
const dataStreamVertexShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uHeight;
    
    attribute float aColumn;
    attribute float aSpeed;
    attribute float aPhase;
    
    varying float vBrightness;
    varying float vColumn;
    
    void main() {
        // Calculate position in stream
        float progress = mod(uTime * aSpeed + aPhase, 1.0);
        
        vec3 pos = position;
        pos.y = uHeight * (1.0 - progress) - uHeight * 0.5;
        
        // Lead particle is brightest
        vBrightness = 1.0 - progress;
        vBrightness = pow(vBrightness, 0.5);
        
        vColumn = aColumn;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        gl_PointSize = (3.0 + vBrightness * 2.0) * (150.0 / -mvPosition.z);
    }
`;

const dataStreamFragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uLeadColor;
    
    varying float vBrightness;
    varying float vColumn;
    
    void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        // Character-like appearance (square-ish)
        float shape = max(abs(center.x), abs(center.y));
        shape = 1.0 - smoothstep(0.3, 0.5, shape);
        
        // Color gradient - lead particle is white
        vec3 color = mix(uColor, uLeadColor, pow(vBrightness, 3.0));
        
        float alpha = shape * vBrightness * 0.9;
        
        gl_FragColor = vec4(color, alpha);
    }
`;

export default function DataStream({
    columns = 30,
    particlesPerColumn = 15,
    position = [0, 0, 0],
    spread = [20, 15, 10],
    color = '#00ff41',
    leadColor = '#ffffff',
    speed = 0.3
}) {
    const pointsRef = useRef();
    const count = columns * particlesPerColumn;

    const { positions, columnIds, speeds, phases } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const columnIds = new Float32Array(count);
        const speeds = new Float32Array(count);
        const phases = new Float32Array(count);

        for (let col = 0; col < columns; col++) {
            const x = (col / columns - 0.5) * spread[0];
            const z = (Math.random() - 0.5) * spread[2];

            for (let p = 0; p < particlesPerColumn; p++) {
                const i = col * particlesPerColumn + p;

                positions[i * 3] = x;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = z;

                columnIds[i] = col;
                speeds[i] = speed * (0.3 + Math.random() * 0.7);
                phases[i] = (p / particlesPerColumn) + (col * 0.1) % 1;
            }
        }

        return { positions, columnIds, speeds, phases };
    }, [columns, particlesPerColumn, spread, speed, count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uLeadColor: { value: new THREE.Color(leadColor) },
        uSpeed: { value: speed },
        uHeight: { value: spread[1] },
    }), [color, leadColor, speed, spread]);

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
                    attach="attributes-aColumn"
                    count={count}
                    array={columnIds}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aSpeed"
                    count={count}
                    array={speeds}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aPhase"
                    count={count}
                    array={phases}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={dataStreamVertexShader}
                fragmentShader={dataStreamFragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── MATRIX RAIN ─── */
export function MatrixRain({ position = [0, 0, -5] }) {
    return (
        <DataStream
            columns={40}
            particlesPerColumn={20}
            position={position}
            spread={[30, 20, 15]}
            color="#00ff41"
            leadColor="#aaffaa"
            speed={0.4}
        />
    );
}

/* ─── GOLDEN DATA STREAM ─── */
export function GoldenDataStream({ position = [0, 0, 0] }) {
    return (
        <DataStream
            columns={25}
            particlesPerColumn={12}
            position={position}
            spread={[20, 15, 10]}
            color="#ffd700"
            leadColor="#ffffff"
            speed={0.25}
        />
    );
}

export { dataStreamVertexShader, dataStreamFragmentShader };
