/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VIGNETTE 3D EFFECT - Cinematic Edge Darkening
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium vignette with:
 * - Smooth radial gradient
 * - Configurable softness and intensity
 * - Optional color tinting
 * - Oval shape support
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── VIGNETTE SHADER ─── */
const vignetteShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uIntensity;
        uniform float uSoftness;
        uniform float uRoundness;
        uniform vec3 uColor;
        uniform float uAspect;
        varying vec2 vUv;
        
        void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 uv = vUv - center;
            
            // Adjust for aspect ratio
            uv.x *= uAspect;
            
            // Calculate distance from center
            float dist = length(uv) * 2.0;
            
            // Apply roundness (1.0 = circle, <1.0 = more oval)
            dist = pow(dist, uRoundness);
            
            // Calculate vignette with softness
            float vignette = smoothstep(1.0 - uSoftness, 1.0, dist);
            vignette *= uIntensity;
            
            // Output with color tint
            gl_FragColor = vec4(uColor, vignette);
        }
    `
};

/* ─── REACT COMPONENT ─── */
export default function Vignette3D({
    intensity = 0.5,
    softness = 0.5,
    roundness = 1.0,
    color = '#000000'
}) {
    const meshRef = useRef();
    const { viewport, size } = useThree();

    const uniforms = useMemo(() => ({
        uIntensity: { value: intensity },
        uSoftness: { value: softness },
        uRoundness: { value: roundness },
        uColor: { value: new THREE.Color(color) },
        uAspect: { value: size.width / size.height },
    }), []);

    // Update uniforms reactively
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uIntensity.value = intensity;
            meshRef.current.material.uniforms.uSoftness.value = softness;
            meshRef.current.material.uniforms.uRoundness.value = roundness;
            meshRef.current.material.uniforms.uAspect.value = size.width / size.height;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.1]} renderOrder={1000}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vignetteShader.vertexShader}
                fragmentShader={vignetteShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </mesh>
    );
}

/* ─── ANIMATED VIGNETTE FOR CHAOS ─── */
export function AnimatedVignette({
    baseIntensity = 0.3,
    maxIntensity = 0.8,
    pulseSpeed = 1.0,
    color = '#000000'
}) {
    const meshRef = useRef();
    const { viewport, size } = useThree();

    const uniforms = useMemo(() => ({
        uIntensity: { value: baseIntensity },
        uSoftness: { value: 0.4 },
        uRoundness: { value: 1.0 },
        uColor: { value: new THREE.Color(color) },
        uAspect: { value: size.width / size.height },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const t = clock.getElapsedTime();
            const pulse = (Math.sin(t * pulseSpeed) + 1) / 2;
            const intensity = baseIntensity + pulse * (maxIntensity - baseIntensity);
            meshRef.current.material.uniforms.uIntensity.value = intensity;
            meshRef.current.material.uniforms.uAspect.value = size.width / size.height;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.1]} renderOrder={1000}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vignetteShader.vertexShader}
                fragmentShader={vignetteShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
}

export { vignetteShader };
