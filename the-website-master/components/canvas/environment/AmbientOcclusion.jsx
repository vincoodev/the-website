/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AMBIENT OCCLUSION - Contact Shadows Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium shadow system:
 * - Soft contact shadows
 * - Ground shadow plane
 * - Animated shadow updates
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── CONTACT SHADOW SHADER ─── */
const contactShadowShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uShadowColor;
        uniform float uIntensity;
        uniform float uBlur;
        uniform float uRadius;
        uniform vec3 uObjectPosition;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            // Distance from object
            float dist = length(vWorldPosition.xz - uObjectPosition.xz);
            
            // Shadow falloff
            float shadow = 1.0 - smoothstep(0.0, uRadius, dist);
            shadow = pow(shadow, uBlur);
            shadow *= uIntensity;
            
            // Subtle animation
            float pulse = sin(uTime * 0.5) * 0.05 + 0.95;
            shadow *= pulse;
            
            gl_FragColor = vec4(uShadowColor, shadow);
        }
    `
};

/* ─── CONTACT SHADOW COMPONENT ─── */
export function ContactShadow({
    position = [0, 0.01, 0],
    objectPosition = [0, 0, 0],
    color = '#000000',
    intensity = 0.5,
    blur = 2.0,
    radius = 3.0,
    size = 10
}) {
    const meshRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uShadowColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uBlur: { value: blur },
        uRadius: { value: radius },
        uObjectPosition: { value: new THREE.Vector3(...objectPosition) },
    }), [color, intensity, blur, radius, objectPosition]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={position}>
            <planeGeometry args={[size, size]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={contactShadowShader.vertexShader}
                fragmentShader={contactShadowShader.fragmentShader}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
}

/* ─── GROUND SHADOW PLANE ─── */
export function GroundShadow({
    size = 30,
    opacity = 0.3,
    blur = true
}) {
    const meshRef = useRef();

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            receiveShadow
        >
            <planeGeometry args={[size, size]} />
            <shadowMaterial
                opacity={opacity}
                transparent={true}
            />
        </mesh>
    );
}

/* ─── COLUMN SHADOWS ─── */
export function ColumnShadows({ positions = [], intensity = 0.4 }) {
    return (
        <group>
            {positions.map((pos, i) => (
                <ContactShadow
                    key={i}
                    position={[pos[0], 0.01, pos[2]]}
                    objectPosition={pos}
                    intensity={intensity}
                    radius={1.5}
                    blur={1.5}
                />
            ))}
        </group>
    );
}

export default ContactShadow;
export { contactShadowShader };
