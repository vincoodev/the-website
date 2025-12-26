/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GLITCH EFFECT - Digital Corruption & Chaos
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium chaos visualization:
 * - RGB split with jitter
 * - Horizontal line displacement
 * - Block corruption
 * - Noise interference
 * - Phase-reactive intensity
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── GLITCH SHADER ─── */
const glitchShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uBlockSize;
        uniform float uRGBShift;
        uniform float uScanlineJitter;
        uniform float uNoiseAmount;
        uniform bool uActive;
        uniform vec2 uResolution;
        varying vec2 vUv;
        
        // Hash function for random
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // Block noise
        float blockNoise(vec2 uv, float size) {
            vec2 block = floor(uv * size);
            return hash(block + floor(uTime * 10.0));
        }
        
        void main() {
            if (!uActive) {
                discard;
                return;
            }
            
            vec2 uv = vUv;
            
            // Random glitch trigger
            float glitchTrigger = step(0.99 - uIntensity * 0.1, hash(vec2(floor(uTime * 20.0), 0.0)));
            
            if (glitchTrigger > 0.5) {
                // Horizontal line displacement
                float lineJitter = step(0.95, hash(vec2(floor(uv.y * 50.0), floor(uTime * 15.0))));
                uv.x += lineJitter * uScanlineJitter * (hash(vec2(uv.y, uTime)) - 0.5);
                
                // Block displacement
                float blockGlitch = blockNoise(uv, uBlockSize);
                if (blockGlitch > 0.95) {
                    uv.x += (hash(vec2(blockGlitch, uTime)) - 0.5) * 0.1;
                    uv.y += (hash(vec2(uTime, blockGlitch)) - 0.5) * 0.05;
                }
            }
            
            // RGB Channel separation
            float rgbOffset = uRGBShift * uIntensity * glitchTrigger;
            
            // Sample with offset (simulated - in real use would sample texture)
            vec3 color = vec3(0.0);
            
            // Create digital noise pattern
            float noise = hash(uv * uResolution + uTime * 100.0);
            float noisePattern = step(1.0 - uNoiseAmount * uIntensity, noise);
            
            // Corruption blocks
            float corruption = blockNoise(uv, uBlockSize * 2.0);
            corruption = step(0.97, corruption) * uIntensity;
            
            // Scanline effect
            float scanline = sin(uv.y * uResolution.y * 2.0 + uTime * 50.0) * 0.5 + 0.5;
            scanline = pow(scanline, 4.0) * 0.3 * uIntensity;
            
            // Combine effects
            float alpha = 0.0;
            alpha += noisePattern * 0.5;
            alpha += corruption * 0.8;
            alpha += scanline * glitchTrigger;
            
            // Digital artifact colors
            vec3 artifactColor = vec3(
                step(0.5, hash(uv + uTime)),
                step(0.7, hash(uv * 2.0 + uTime)),
                step(0.6, hash(uv * 3.0 + uTime))
            ) * corruption;
            
            // Red tint for danger
            artifactColor += vec3(0.8, 0.1, 0.1) * noisePattern * 0.5;
            
            gl_FragColor = vec4(artifactColor, alpha * uIntensity);
        }
    `
};

/* ─── MAIN COMPONENT ─── */
export default function GlitchEffect({
    active = false,
    intensity = 0.5,
    blockSize = 10.0,
    rgbShift = 0.02,
    scanlineJitter = 0.1,
    noiseAmount = 0.3
}) {
    const meshRef = useRef();
    const { viewport, size } = useThree();
    const [glitchActive, setGlitchActive] = useState(false);

    // Random glitch bursts
    useEffect(() => {
        if (!active) {
            setGlitchActive(false);
            return;
        }

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setGlitchActive(true);
                setTimeout(() => setGlitchActive(false), 50 + Math.random() * 150);
            }
        }, 100 + Math.random() * 200);

        return () => clearInterval(interval);
    }, [active]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uBlockSize: { value: blockSize },
        uRGBShift: { value: rgbShift },
        uScanlineJitter: { value: scanlineJitter },
        uNoiseAmount: { value: noiseAmount },
        uActive: { value: active },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const mat = meshRef.current.material;
            mat.uniforms.uTime.value = clock.getElapsedTime();
            mat.uniforms.uIntensity.value = glitchActive ? intensity : 0;
            mat.uniforms.uActive.value = active && glitchActive;
            mat.uniforms.uResolution.value.set(size.width, size.height);
        }
    });

    if (!active) return null;

    return (
        <mesh ref={meshRef} position={[0, 0, 0.08]} renderOrder={990}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={glitchShader.vertexShader}
                fragmentShader={glitchShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

/* ─── CONTINUOUS GLITCH FOR EXTREME CHAOS ─── */
export function ExtremeGlitch({ intensity = 1.0 }) {
    const meshRef = useRef();
    const { viewport, size } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uBlockSize: { value: 8.0 },
        uRGBShift: { value: 0.05 },
        uScanlineJitter: { value: 0.2 },
        uNoiseAmount: { value: 0.5 },
        uActive: { value: true },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.08]} renderOrder={990}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={glitchShader.vertexShader}
                fragmentShader={glitchShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

export { glitchShader };
