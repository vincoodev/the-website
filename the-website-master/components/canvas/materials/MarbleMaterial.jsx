/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARBLE MATERIAL - Procedural Greek Marble Shader
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Procedural veining pattern
 * - Subsurface scattering approximation
 * - Physical-based rendering
 * - Subtle color variation
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── MARBLE SHADER ─── */
const marbleVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const marbleFragmentShader = `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uVeinColor;
    uniform float uVeinIntensity;
    uniform float uSubsurface;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // 3D Simplex noise
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) { 
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
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
    
    // Fractal brownian motion for veins
    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        return value;
    }
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Generate marble veins using fbm
        vec3 noiseCoord = vPosition * 2.0;
        float veinPattern = fbm(noiseCoord);
        
        // Make veins more pronounced
        float veins = smoothstep(0.0, 0.3, abs(veinPattern)) * uVeinIntensity;
        veins *= smoothstep(0.8, 0.4, abs(veinPattern)); // Thin out veins
        
        // Add secondary fine veins
        float fineVeins = fbm(noiseCoord * 4.0) * 0.3;
        fineVeins = smoothstep(0.0, 0.2, abs(fineVeins)) * 0.5;
        
        // Color mixing
        vec3 marbleColor = mix(uBaseColor, uVeinColor, veins + fineVeins * 0.3);
        
        // Subsurface scattering approximation
        float sss = pow(max(dot(-viewDir, normal), 0.0), 2.0) * uSubsurface;
        marbleColor += vec3(1.0, 0.95, 0.9) * sss * 0.1;
        
        // Fresnel for polished look
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
        marbleColor += vec3(1.0) * fresnel * 0.15;
        
        // Ambient occlusion approximation in crevices
        float ao = smoothstep(0.0, 0.5, veins + 0.5);
        marbleColor *= mix(0.85, 1.0, ao);
        
        // Subtle sparkle (mica in marble)
        float sparkle = snoise(vPosition * 100.0);
        sparkle = pow(max(sparkle, 0.0), 20.0) * fresnel;
        marbleColor += vec3(1.0) * sparkle * 0.3;
        
        gl_FragColor = vec4(marbleColor, 1.0);
    }
`;

export default function MarbleMaterial({
    baseColor = '#f5f5f5',
    veinColor = '#a5a5a5',
    veinIntensity = 0.8,
    subsurface = 0.5
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(baseColor) },
        uVeinColor: { value: new THREE.Color(veinColor) },
        uVeinIntensity: { value: veinIntensity },
        uSubsurface: { value: subsurface },
    }), [baseColor, veinColor, veinIntensity, subsurface]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={marbleVertexShader}
            fragmentShader={marbleFragmentShader}
            uniforms={uniforms}
            side={THREE.DoubleSide}
        />
    );
}
