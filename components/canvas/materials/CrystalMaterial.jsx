/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRYSTAL MATERIAL - Premium Refractive Glass/Crystal
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ultra-realistic crystal rendering:
 * - Fresnel reflections
 * - Refraction simulation
 * - Internal color dispersion
 * - Sparkle and caustic hints
 * - Animated energy flow option
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── CRYSTAL SHADER ─── */
const crystalVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const crystalFragmentShader = `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uRefractionColor;
    uniform float uIOR;
    uniform float uReflectivity;
    uniform float uDispersion;
    uniform float uSparkle;
    uniform bool uAnimated;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    // Noise for internal patterns
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Fresnel effect - strong reflections at grazing angles
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        fresnel = mix(0.04, 1.0, fresnel);
        
        // Refraction simulation
        vec3 refractDir = refract(-viewDir, normal, 1.0 / uIOR);
        
        // Chromatic dispersion (rainbow effect in refractions)
        float dispersionR = snoise(vWorldPosition * 5.0 + refractDir * uDispersion);
        float dispersionG = snoise(vWorldPosition * 5.0 + refractDir * uDispersion * 1.1);
        float dispersionB = snoise(vWorldPosition * 5.0 + refractDir * uDispersion * 1.2);
        vec3 dispersion = vec3(dispersionR, dispersionG, dispersionB) * 0.3 + 0.7;
        
        // Internal color based on refraction
        vec3 internalColor = uRefractionColor * dispersion;
        
        // Animated internal energy
        if (uAnimated) {
            float energy = snoise(vWorldPosition * 3.0 + vec3(uTime * 0.5));
            energy = pow(max(energy, 0.0), 2.0);
            internalColor += vec3(0.2, 0.4, 1.0) * energy * 0.5;
        }
        
        // Sparkle effect
        float sparkle = snoise(vWorldPosition * 50.0 + uTime * 2.0);
        sparkle = pow(max(sparkle, 0.0), 30.0) * uSparkle;
        
        // Environment reflection approximation
        vec3 reflectDir = reflect(-viewDir, normal);
        float envReflect = pow(max(reflectDir.y * 0.5 + 0.5, 0.0), 2.0);
        vec3 reflectionColor = mix(vec3(0.5, 0.6, 0.8), vec3(1.0), envReflect);
        
        // Combine: internal color + reflection based on fresnel
        vec3 finalColor = mix(internalColor, reflectionColor, fresnel * uReflectivity);
        
        // Add base tint
        finalColor = mix(finalColor, uBaseColor, 0.2);
        
        // Add sparkles
        finalColor += vec3(1.0) * sparkle;
        
        // Slight ambient glow
        finalColor += uBaseColor * 0.05;
        
        gl_FragColor = vec4(finalColor, 0.95);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function CrystalMaterial({
    color = '#88ccff',
    refractionColor = '#ffffff',
    ior = 1.5,
    reflectivity = 0.9,
    dispersion = 0.5,
    sparkle = 1.0,
    animated = false
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(color) },
        uRefractionColor: { value: new THREE.Color(refractionColor) },
        uIOR: { value: ior },
        uReflectivity: { value: reflectivity },
        uDispersion: { value: dispersion },
        uSparkle: { value: sparkle },
        uAnimated: { value: animated },
    }), [color, refractionColor, ior, reflectivity, dispersion, sparkle, animated]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={crystalVertexShader}
            fragmentShader={crystalFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
        />
    );
}

/* ─── DIVINE CRYSTAL (Gold tinted) ─── */
export function DivineCrystalMaterial() {
    return (
        <CrystalMaterial
            color="#ffd700"
            refractionColor="#fff8e0"
            ior={1.8}
            reflectivity={1.0}
            dispersion={0.8}
            sparkle={2.0}
            animated={true}
        />
    );
}

/* ─── ICE CRYSTAL ─── */
export function IceCrystalMaterial() {
    return (
        <CrystalMaterial
            color="#a0d8ef"
            refractionColor="#e0f4ff"
            ior={1.31}
            reflectivity={0.7}
            dispersion={0.3}
            sparkle={0.8}
            animated={false}
        />
    );
}

export { crystalVertexShader, crystalFragmentShader };
