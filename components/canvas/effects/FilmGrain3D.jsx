/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILM GRAIN 3D - Animated Cinematic Noise Overlay
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium film grain effect:
 * - Procedural noise (no texture needed)
 * - Animated temporal variation
 * - Adjustable intensity and size
 * - Color/monochrome modes
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── FILM GRAIN SHADER ─── */
const filmGrainShader = {
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
        uniform float uSize;
        uniform bool uColored;
        uniform vec2 uResolution;
        varying vec2 vUv;
        
        // High quality random function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        // Value noise for smoother grain
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            
            vec2 u = f * f * (3.0 - 2.0 * f);
            
            return mix(a, b, u.x) +
                   (c - a) * u.y * (1.0 - u.x) +
                   (d - b) * u.x * u.y;
        }
        
        void main() {
            // Scale UV by size and add time variation
            vec2 scaledUV = vUv * uResolution / uSize;
            
            // Add temporal variation for animation
            float timeOffset = uTime * 24.0;
            
            if (uColored) {
                // RGB noise for colored grain
                float r = noise(scaledUV + vec2(timeOffset, 0.0)) - 0.5;
                float g = noise(scaledUV + vec2(0.0, timeOffset)) - 0.5;
                float b = noise(scaledUV + vec2(timeOffset * 0.5, timeOffset * 0.5)) - 0.5;
                
                gl_FragColor = vec4(r, g, b, 1.0) * uIntensity;
            } else {
                // Monochrome grain
                float grain = noise(scaledUV + vec2(timeOffset, timeOffset * 0.7)) - 0.5;
                
                gl_FragColor = vec4(vec3(grain), 1.0) * uIntensity;
            }
        }
    `
};

/* ─── STATIC OVERLAY VERSION ─── */
export function FilmGrainOverlay({
    intensity = 0.08,
    size = 2.0,
    colored = false,
    speed = 1.0
}) {
    const meshRef = useRef();
    const { viewport, size: screenSize } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uSize: { value: size },
        uColored: { value: colored },
        uResolution: { value: new THREE.Vector2(screenSize.width, screenSize.height) },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime() * speed;
            meshRef.current.material.uniforms.uIntensity.value = intensity;
            meshRef.current.material.uniforms.uResolution.value.set(screenSize.width, screenSize.height);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.05]} renderOrder={998}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={filmGrainShader.vertexShader}
                fragmentShader={filmGrainShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

/* ─── SCANLINES EFFECT ─── */
const scanlinesShader = {
    fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uLineCount;
        uniform float uSpeed;
        varying vec2 vUv;
        
        void main() {
            float lines = sin(vUv.y * uLineCount + uTime * uSpeed) * 0.5 + 0.5;
            lines = pow(lines, 2.0);
            
            float alpha = (1.0 - lines) * uIntensity;
            
            gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
    `
};

export function Scanlines({
    intensity = 0.1,
    lineCount = 400,
    speed = 2.0
}) {
    const meshRef = useRef();
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uLineCount: { value: lineCount },
        uSpeed: { value: speed },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.06]} renderOrder={997}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={filmGrainShader.vertexShader}
                fragmentShader={scanlinesShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
}

export default FilmGrainOverlay;
export { filmGrainShader, scanlinesShader };
