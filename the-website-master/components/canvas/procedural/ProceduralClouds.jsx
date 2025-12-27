/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL CLOUDS - Volumetric Divine Clouds
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Noise-displaced sphere instances
 * - Soft volumetric rendering
 * - Animated drift motion
 * - God ray integration ready
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── CLOUD SHADER ─── */
const cloudVertexShader = `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vDepth;
    
    // Simplex noise
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
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
        // Animate position based on noise
        vec3 pos = position;
        float noise = snoise(position * 0.5 + uTime * 0.1) * 0.3;
        pos += normal * noise;
        
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        vDepth = -mvPosition.z;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const cloudFragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uOpacity;
    uniform float uTime;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vDepth;
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Soft edge falloff
        float edgeFalloff = pow(max(dot(viewDir, normal), 0.0), 1.5);
        
        // Fresnel glow on edges
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        
        // Mix base color with glow
        vec3 color = mix(uColor, uGlowColor, fresnel * 0.5);
        
        // Subtle internal glow animation
        float internalGlow = sin(uTime * 0.5 + vDepth * 0.1) * 0.1 + 0.9;
        color *= internalGlow;
        
        // Calculate alpha
        float alpha = edgeFalloff * uOpacity;
        alpha = clamp(alpha, 0.0, 1.0);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

/* ─── SINGLE CLOUD ─── */
function Cloud({ position, scale, speed, color, glowColor, opacity }) {
    const meshRef = useRef();
    const materialRef = useRef();
    const initialPos = useMemo(() => [...position], []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uGlowColor: { value: new THREE.Color(glowColor) },
        uOpacity: { value: opacity },
    }), [color, glowColor, opacity]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
        if (meshRef.current) {
            // Drift motion
            meshRef.current.position.x = initialPos[0] + Math.sin(clock.getElapsedTime() * speed * 0.2) * 0.5;
            meshRef.current.position.y = initialPos[1] + Math.cos(clock.getElapsedTime() * speed * 0.15) * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <icosahedronGeometry args={[1, 4]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={cloudVertexShader}
                fragmentShader={cloudFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

/* ─── MAIN CLOUDS COMPONENT ─── */
export default function ProceduralClouds({
    count = 15,
    spread = [20, 8, 15],
    basePosition = [0, 5, -10],
    color = '#ffffff',
    glowColor = '#ffd700',
    opacity = 0.4,
    minScale = 2,
    maxScale = 5
}) {
    const clouds = useMemo(() => {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push({
                id: i,
                position: [
                    basePosition[0] + (Math.random() - 0.5) * spread[0],
                    basePosition[1] + (Math.random() - 0.5) * spread[1],
                    basePosition[2] + (Math.random() - 0.5) * spread[2],
                ],
                scale: minScale + Math.random() * (maxScale - minScale),
                speed: 0.5 + Math.random() * 0.5,
            });
        }
        return result;
    }, [count, spread, basePosition, minScale, maxScale]);

    return (
        <group>
            {clouds.map((cloud) => (
                <Cloud
                    key={cloud.id}
                    position={cloud.position}
                    scale={cloud.scale}
                    speed={cloud.speed}
                    color={color}
                    glowColor={glowColor}
                    opacity={opacity}
                />
            ))}
        </group>
    );
}
