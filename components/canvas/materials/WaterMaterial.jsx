/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WATER MATERIAL - Reflective Animated Water Surface
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Realistic water rendering:
 * - Animated wave displacement
 * - Fresnel reflections
 * - Specular highlights
 * - Depth-based coloring
 * - Foam at edges
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── WATER SHADER ─── */
const waterVertexShader = `
    uniform float uTime;
    uniform float uWaveHeight;
    uniform float uWaveFrequency;
    uniform float uWaveSpeed;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying float vElevation;
    
    // Simplex noise for waves
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                          -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
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
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    
    void main() {
        vUv = uv;
        
        // Multi-layered wave displacement
        vec2 waveCoord1 = position.xz * uWaveFrequency + uTime * uWaveSpeed;
        vec2 waveCoord2 = position.xz * uWaveFrequency * 0.5 - uTime * uWaveSpeed * 0.7;
        vec2 waveCoord3 = position.xz * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 0.3;
        
        float wave1 = snoise(waveCoord1) * uWaveHeight;
        float wave2 = snoise(waveCoord2) * uWaveHeight * 0.5;
        float wave3 = snoise(waveCoord3) * uWaveHeight * 0.25;
        
        float elevation = wave1 + wave2 + wave3;
        vElevation = elevation;
        
        vec3 displacedPosition = position;
        displacedPosition.y += elevation;
        
        // Calculate displaced normal
        float delta = 0.1;
        float elevationDx = (snoise(waveCoord1 + vec2(delta, 0.0)) - snoise(waveCoord1 - vec2(delta, 0.0)));
        float elevationDz = (snoise(waveCoord1 + vec2(0.0, delta)) - snoise(waveCoord1 - vec2(0.0, delta)));
        vec3 displacedNormal = normalize(vec3(-elevationDx * uWaveHeight, 1.0, -elevationDz * uWaveHeight));
        
        vNormal = normalize(normalMatrix * displacedNormal);
        
        vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const waterFragmentShader = `
    uniform float uTime;
    uniform vec3 uShallowColor;
    uniform vec3 uDeepColor;
    uniform vec3 uFoamColor;
    uniform float uOpacity;
    uniform float uFresnel;
    uniform float uSpecularPower;
    uniform vec3 uLightDirection;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightDirection);
        
        // Fresnel for reflectivity at grazing angles
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnel);
        
        // Depth-based color (elevation = depth approximation)
        float depth = (vElevation + 0.5) * 2.0;
        depth = clamp(depth, 0.0, 1.0);
        vec3 waterColor = mix(uDeepColor, uShallowColor, depth);
        
        // Add sky reflection approximation
        vec3 reflectDir = reflect(-viewDir, normal);
        float skyReflect = pow(max(reflectDir.y * 0.5 + 0.5, 0.0), 2.0);
        vec3 reflectionColor = mix(vec3(0.4, 0.5, 0.6), vec3(0.8, 0.85, 0.9), skyReflect);
        
        // Specular highlight (sun reflection)
        vec3 halfVector = normalize(lightDir + viewDir);
        float specular = pow(max(dot(normal, halfVector), 0.0), uSpecularPower);
        
        // Foam at wave peaks
        float foam = smoothstep(0.2, 0.4, vElevation);
        foam = pow(foam, 2.0) * 0.5;
        
        // Combine
        vec3 finalColor = mix(waterColor, reflectionColor, fresnel * 0.6);
        finalColor += vec3(1.0, 0.98, 0.95) * specular * 0.8;
        finalColor = mix(finalColor, uFoamColor, foam);
        
        // Subtle caustics pattern
        float caustics = sin(vWorldPosition.x * 10.0 + uTime * 2.0) * 
                        sin(vWorldPosition.z * 10.0 + uTime * 1.5);
        caustics = pow(max(caustics, 0.0), 4.0) * 0.2;
        finalColor += vec3(1.0) * caustics * (1.0 - fresnel);
        
        float alpha = uOpacity + fresnel * 0.2;
        
        gl_FragColor = vec4(finalColor, alpha);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function WaterMaterial({
    shallowColor = '#40c4ff',
    deepColor = '#003366',
    foamColor = '#ffffff',
    waveHeight = 0.3,
    waveFrequency = 0.5,
    waveSpeed = 0.3,
    opacity = 0.85,
    fresnelPower = 3.0,
    specularPower = 256.0,
    lightDirection = [1, 1, 1]
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uShallowColor: { value: new THREE.Color(shallowColor) },
        uDeepColor: { value: new THREE.Color(deepColor) },
        uFoamColor: { value: new THREE.Color(foamColor) },
        uWaveHeight: { value: waveHeight },
        uWaveFrequency: { value: waveFrequency },
        uWaveSpeed: { value: waveSpeed },
        uOpacity: { value: opacity },
        uFresnel: { value: fresnelPower },
        uSpecularPower: { value: specularPower },
        uLightDirection: { value: new THREE.Vector3(...lightDirection).normalize() },
    }), [shallowColor, deepColor, foamColor, waveHeight, waveFrequency, waveSpeed, opacity, fresnelPower, specularPower, lightDirection]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={waterVertexShader}
            fragmentShader={waterFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
        />
    );
}

/* ─── DIVINE POOL ─── */
export function DivineWaterMaterial() {
    return (
        <WaterMaterial
            shallowColor="#ffd700"
            deepColor="#996600"
            foamColor="#fffacd"
            waveHeight={0.1}
            waveFrequency={0.8}
            waveSpeed={0.2}
            opacity={0.9}
        />
    );
}

/* ─── MYSTICAL POOL ─── */
export function MysticalWaterMaterial() {
    return (
        <WaterMaterial
            shallowColor="#9966ff"
            deepColor="#2a0a40"
            foamColor="#e0d0ff"
            waveHeight={0.15}
            waveFrequency={0.6}
            waveSpeed={0.15}
            opacity={0.85}
        />
    );
}

export { waterVertexShader, waterFragmentShader };
