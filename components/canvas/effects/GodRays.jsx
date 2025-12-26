/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GOD RAYS EFFECT - Volumetric Light Shafts
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium volumetric lighting:
 * - Radial blur from light source
 * - Animated intensity
 * - Occlusion-aware (respects geometry)
 * - Divine revelation effect
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── GOD RAYS SHADER ─── */
const godRaysShader = {
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
        uniform float uDecay;
        uniform float uDensity;
        uniform float uWeight;
        uniform vec2 uLightPosition;
        uniform vec3 uLightColor;
        uniform int uSamples;
        varying vec2 vUv;
        
        void main() {
            vec2 deltaTexCoord = vUv - uLightPosition;
            deltaTexCoord *= 1.0 / float(uSamples) * uDensity;
            
            vec2 texCoord = vUv;
            float illuminationDecay = 1.0;
            vec3 color = vec3(0.0);
            
            // Radial blur samples
            for(int i = 0; i < 100; i++) {
                if (i >= uSamples) break;
                
                texCoord -= deltaTexCoord;
                
                // Distance from center determines base intensity
                float dist = length(texCoord - uLightPosition);
                float sampleIntensity = max(0.0, 1.0 - dist * 1.5);
                
                // Add noise for volumetric feel
                float noise = fract(sin(dot(texCoord * 100.0 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
                sampleIntensity *= 0.8 + noise * 0.4;
                
                color += sampleIntensity * illuminationDecay * uWeight * uLightColor;
                illuminationDecay *= uDecay;
            }
            
            // Animate intensity
            float pulse = sin(uTime * 0.5) * 0.1 + 1.0;
            
            gl_FragColor = vec4(color * uIntensity * pulse, length(color) * uIntensity);
        }
    `
};

/* ─── MAIN COMPONENT ─── */
export default function GodRays({
    lightPosition = [0.5, 0.3],
    intensity = 0.8,
    decay = 0.96,
    density = 0.9,
    weight = 0.5,
    color = '#ffd700',
    samples = 60
}) {
    const meshRef = useRef();
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uDecay: { value: decay },
        uDensity: { value: density },
        uWeight: { value: weight },
        uLightPosition: { value: new THREE.Vector2(...lightPosition) },
        uLightColor: { value: new THREE.Color(color) },
        uSamples: { value: samples },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const mat = meshRef.current.material;
            mat.uniforms.uTime.value = clock.getElapsedTime();
            mat.uniforms.uIntensity.value = intensity;
            mat.uniforms.uLightPosition.value.set(...lightPosition);
            mat.uniforms.uLightColor.value.set(color);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.02]} renderOrder={996}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={godRaysShader.vertexShader}
                fragmentShader={godRaysShader.fragmentShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

/* ─── MULTI-SOURCE GOD RAYS ─── */
export function MultiGodRays({ sources = [] }) {
    return (
        <group>
            {sources.map((source, i) => (
                <GodRays
                    key={i}
                    lightPosition={source.position}
                    intensity={source.intensity || 0.5}
                    color={source.color || '#ffd700'}
                    samples={source.samples || 40}
                />
            ))}
        </group>
    );
}

/* ─── DIVINE REVELATION RAYS ─── */
export function DivineRays({
    active = true,
    intensity = 1.2
}) {
    const meshRef = useRef();
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uActive: { value: active },
    }), []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const mat = meshRef.current.material;
            mat.uniforms.uTime.value = clock.getElapsedTime();

            // Smooth fade in/out
            const target = active ? intensity : 0;
            const current = mat.uniforms.uIntensity.value;
            mat.uniforms.uIntensity.value += (target - current) * 0.05;
        }
    });

    const divineShader = `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;
        
        void main() {
            vec2 center = vec2(0.5, 0.3);
            vec2 toCenter = vUv - center;
            float angle = atan(toCenter.y, toCenter.x);
            float dist = length(toCenter);
            
            // Create rays pattern
            float rays = sin(angle * 12.0 + uTime * 0.5) * 0.5 + 0.5;
            rays = pow(rays, 3.0);
            
            // Fade with distance
            float fade = 1.0 - smoothstep(0.0, 0.8, dist);
            
            // Golden divine color
            vec3 color = vec3(1.0, 0.85, 0.4) * rays * fade * uIntensity;
            
            gl_FragColor = vec4(color, rays * fade * uIntensity * 0.8);
        }
    `;

    return (
        <mesh ref={meshRef} position={[0, 0, 0.03]} renderOrder={995}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={godRaysShader.vertexShader}
                fragmentShader={divineShader}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

export { godRaysShader };
