/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHROMATIC ABERRATION - RGB Channel Separation Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium lens distortion effect:
 * - Per-channel UV offset
 * - Radial falloff from center
 * - Animated chaos mode
 * - Low performance impact
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── CHROMATIC ABERRATION SHADER ─── */
const chromaticAberrationShader = {
    uniforms: {
        tDiffuse: { value: null },
        uOffset: { value: 0.005 },
        uRadialFalloff: { value: 1.0 },
        uTime: { value: 0 },
        uAnimated: { value: false },
        uAnimationSpeed: { value: 1.0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uOffset;
        uniform float uRadialFalloff;
        uniform float uTime;
        uniform bool uAnimated;
        uniform float uAnimationSpeed;
        varying vec2 vUv;
        
        void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 toCenter = vUv - center;
            float dist = length(toCenter);
            
            // Radial falloff - stronger at edges
            float radialMask = pow(dist * 2.0, uRadialFalloff);
            
            // Animation for chaos mode
            float offset = uOffset;
            if (uAnimated) {
                offset *= 1.0 + sin(uTime * uAnimationSpeed) * 0.5;
                offset += sin(uTime * uAnimationSpeed * 2.0 + dist * 10.0) * 0.002;
            }
            
            // Direction from center for radial aberration
            vec2 direction = normalize(toCenter);
            
            // Sample RGB with different offsets
            float r = texture2D(tDiffuse, vUv + direction * offset * radialMask).r;
            float g = texture2D(tDiffuse, vUv).g;
            float b = texture2D(tDiffuse, vUv - direction * offset * radialMask).b;
            
            gl_FragColor = vec4(r, g, b, 1.0);
        }
    `
};

/* ─── REACT COMPONENT - Screen Effect ─── */
export function ChromaticAberrationEffect({
    offset = 0.005,
    radialFalloff = 1.0,
    animated = false,
    animationSpeed = 1.0
}) {
    const meshRef = useRef();
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        tDiffuse: { value: null },
        uOffset: { value: offset },
        uRadialFalloff: { value: radialFalloff },
        uTime: { value: 0 },
        uAnimated: { value: animated },
        uAnimationSpeed: { value: animationSpeed },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
            meshRef.current.material.uniforms.uOffset.value = offset;
            meshRef.current.material.uniforms.uAnimated.value = animated;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={999}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={chromaticAberrationShader.vertexShader}
                fragmentShader={chromaticAberrationShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
}

/* ─── MATERIAL FOR CUSTOM OBJECTS ─── */
export function useChromaticMaterial(options = {}) {
    const { offset = 0.005, radialFalloff = 1.0, animated = false } = options;

    return useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null },
            uOffset: { value: offset },
            uRadialFalloff: { value: radialFalloff },
            uTime: { value: 0 },
            uAnimated: { value: animated },
            uAnimationSpeed: { value: 1.0 },
        },
        vertexShader: chromaticAberrationShader.vertexShader,
        fragmentShader: chromaticAberrationShader.fragmentShader,
        transparent: true,
    }), [offset, radialFalloff, animated]);
}

export default ChromaticAberrationEffect;
export { chromaticAberrationShader };
