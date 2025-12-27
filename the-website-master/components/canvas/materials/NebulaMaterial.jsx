/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NEBULA MATERIAL - Deep Space Volumetric Clouds
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Cosmic nebula visualization:
 * - Volumetric cloud effect
 * - Multi-layer color mixing
 * - Animated drift
 * - Star sparkle integration
 * - Depth-based transparency
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── NEBULA SHADER ─── */
const nebulaVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    void main() {
        vUv = uv;
        vPosition = position;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const nebulaFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uDensity;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uBrightness;
    uniform bool uStars;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    // 3D Simplex noise
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
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
        
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
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
    
    // Fractal brownian motion
    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
            value += amplitude * (snoise(p * frequency) * 0.5 + 0.5);
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        return value;
    }
    
    // Hash for stars
    float hash(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    void main() {
        vec3 coord = vWorldPosition * uScale;
        coord.z += uTime * uSpeed;
        
        // Multi-octave nebula density
        float density1 = fbm(coord);
        float density2 = fbm(coord * 2.0 + 100.0);
        float density3 = fbm(coord * 0.5 + 200.0);
        
        // Combine densities
        float totalDensity = density1 * 0.5 + density2 * 0.3 + density3 * 0.2;
        totalDensity = pow(totalDensity, uDensity);
        
        // Color layers based on density
        vec3 nebulaColor = vec3(0.0);
        nebulaColor += uColor1 * smoothstep(0.2, 0.5, density1);
        nebulaColor += uColor2 * smoothstep(0.3, 0.6, density2);
        nebulaColor += uColor3 * smoothstep(0.4, 0.7, density3);
        
        // Core brightness
        float core = pow(totalDensity, 2.0);
        nebulaColor += vec3(1.0, 0.9, 0.8) * core * 0.3;
        
        // Stars layer
        if (uStars) {
            vec3 starCoord = floor(vWorldPosition * 50.0);
            float star = hash(starCoord);
            star = step(0.998, star);
            
            // Twinkle
            float twinkle = sin(uTime * 5.0 + star * 100.0) * 0.5 + 0.5;
            star *= twinkle;
            
            nebulaColor += vec3(1.0) * star;
        }
        
        // Apply brightness
        nebulaColor *= uBrightness;
        
        // Alpha based on density
        float alpha = totalDensity * 0.8;
        alpha = clamp(alpha, 0.0, 1.0);
        
        gl_FragColor = vec4(nebulaColor, alpha);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function NebulaMaterial({
    color1 = '#4a2080',
    color2 = '#2060a0',
    color3 = '#802060',
    density = 1.5,
    speed = 0.05,
    scale = 0.3,
    brightness = 1.0,
    stars = true
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
        uDensity: { value: density },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
        uStars: { value: stars },
    }), [color1, color2, color3, density, speed, scale, brightness, stars]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={nebulaVertexShader}
            fragmentShader={nebulaFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    );
}

/* ─── COSMIC NEBULA ─── */
export function CosmicNebulaMaterial() {
    return (
        <NebulaMaterial
            color1="#6633cc"
            color2="#3366cc"
            color3="#cc3366"
            density={1.8}
            speed={0.03}
            scale={0.25}
            brightness={1.2}
            stars={true}
        />
    );
}

/* ─── DIVINE NEBULA ─── */
export function DivineNebulaMaterial() {
    return (
        <NebulaMaterial
            color1="#ffd700"
            color2="#ff9900"
            color3="#ffcc66"
            density={2.0}
            speed={0.02}
            scale={0.2}
            brightness={1.5}
            stars={false}
        />
    );
}

export { nebulaVertexShader, nebulaFragmentShader };
