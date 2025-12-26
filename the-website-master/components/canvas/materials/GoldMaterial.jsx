/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GOLD MATERIAL - Procedural Metallic Gold Shader
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Physically-based metallic rendering
 * - Procedural micro-scratches
 * - Animated subtle shimmer
 * - Environment reflection approximation
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── GOLD SHADER ─── */
const goldVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const goldFragmentShader = `
    uniform float uTime;
    uniform vec3 uGoldColor;
    uniform vec3 uGoldHighlight;
    uniform float uRoughness;
    uniform float uMetalness;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    // Simplex noise for procedural details
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                          -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                        + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Micro-scratches from noise
        float scratch = snoise(vUv * 50.0) * 0.05;
        normal = normalize(normal + vec3(scratch, scratch, 0.0));
        
        // Fresnel effect for edge glow
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        
        // Environment reflection approximation
        vec3 reflectDir = reflect(-viewDir, normal);
        float envReflect = pow(max(reflectDir.y * 0.5 + 0.5, 0.0), 2.0);
        
        // Base gold with subtle color variation
        float colorNoise = snoise(vUv * 10.0 + uTime * 0.1) * 0.1;
        vec3 baseColor = mix(uGoldColor, uGoldHighlight, colorNoise + 0.5);
        
        // Metallic highlights
        float highlight = pow(envReflect, 4.0) * (1.0 - uRoughness);
        
        // Shimmer animation
        float shimmer = sin(vWorldPosition.x * 20.0 + vWorldPosition.y * 20.0 + uTime * 2.0) * 0.5 + 0.5;
        shimmer = pow(shimmer, 8.0) * 0.3;
        
        // Combine
        vec3 finalColor = baseColor;
        finalColor += vec3(1.0, 0.95, 0.8) * highlight * 0.8;
        finalColor += vec3(1.0, 0.9, 0.7) * fresnel * 0.4;
        finalColor += vec3(1.0, 1.0, 0.9) * shimmer * fresnel;
        
        // Metalness darkens non-reflective areas
        finalColor *= mix(0.6, 1.0, envReflect * uMetalness + fresnel);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export default function GoldMaterial({
    roughness = 0.3,
    metalness = 1.0,
    color = '#d4af37',
    highlightColor = '#ffd700'
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uGoldColor: { value: new THREE.Color(color) },
        uGoldHighlight: { value: new THREE.Color(highlightColor) },
        uRoughness: { value: roughness },
        uMetalness: { value: metalness },
    }), [color, highlightColor, roughness, metalness]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={goldVertexShader}
            fragmentShader={goldFragmentShader}
            uniforms={uniforms}
            side={THREE.DoubleSide}
        />
    );
}

/* ─── SIMPLE GOLD FOR DREI MESHES ─── */
export function useGoldMaterial({ roughness = 0.3, metalness = 1.0 } = {}) {
    return useMemo(() => new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: metalness,
        roughness: roughness,
        envMapIntensity: 1.5,
    }), [roughness, metalness]);
}
