/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GPU PARTICLE SYSTEM - High Performance Particles
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ultra-performance particle system:
 * - GPU-computed positions via shaders
 * - Thousands of particles at 60fps
 * - Configurable behaviors
 * - Multiple emitter shapes
 * - Color/size over lifetime
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── GPU PARTICLE SHADER ─── */
const particleVertexShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uSpread;
    uniform float uSize;
    uniform float uSizeVariation;
    uniform vec3 uGravity;
    uniform float uTurbulence;
    uniform float uLifetime;
    
    attribute float aOffset;
    attribute float aScale;
    attribute vec3 aVelocity;
    
    varying float vLifeProgress;
    varying float vAlpha;
    
    // Noise for turbulence
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
    
    void main() {
        // Calculate life progress (0-1 looping)
        float particleTime = mod(uTime * uSpeed + aOffset * uLifetime, uLifetime);
        vLifeProgress = particleTime / uLifetime;
        
        // Start position from attribute + spread
        vec3 pos = position * uSpread;
        
        // Apply velocity over time
        pos += aVelocity * particleTime;
        
        // Apply gravity
        pos += uGravity * particleTime * particleTime * 0.5;
        
        // Apply turbulence
        if (uTurbulence > 0.0) {
            vec3 turbulence = vec3(
                snoise(pos * 2.0 + uTime),
                snoise(pos * 2.0 + uTime + 100.0),
                snoise(pos * 2.0 + uTime + 200.0)
            ) * uTurbulence * vLifeProgress;
            pos += turbulence;
        }
        
        // Calculate alpha (fade in and out)
        vAlpha = sin(vLifeProgress * 3.14159);
        vAlpha = pow(vAlpha, 0.5);
        
        // Size over lifetime
        float size = uSize * aScale * uSizeVariation;
        size *= (1.0 - vLifeProgress * 0.5); // Shrink slightly
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = size * (300.0 / -mvPosition.z);
    }
`;

const particleFragmentShader = `
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uOpacity;
    uniform bool uSoft;
    
    varying float vLifeProgress;
    varying float vAlpha;
    
    void main() {
        // Circular point
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        // Soft edges
        float alpha = vAlpha * uOpacity;
        if (uSoft) {
            alpha *= 1.0 - smoothstep(0.3, 0.5, dist);
        }
        
        // Color over lifetime
        vec3 color = mix(uColorStart, uColorEnd, vLifeProgress);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

/* ─── GPU PARTICLE SYSTEM COMPONENT ─── */
export default function GPUParticleSystem({
    count = 1000,
    position = [0, 0, 0],
    colorStart = '#ffffff',
    colorEnd = '#ffaa00',
    size = 1.0,
    sizeVariation = 1.0,
    speed = 1.0,
    spread = 1.0,
    gravity = [0, 0, 0],
    turbulence = 0.5,
    lifetime = 3.0,
    opacity = 1.0,
    soft = true,
    blending = 'additive'
}) {
    const pointsRef = useRef();

    // Generate particle attributes
    const { positions, offsets, scales, velocities } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const offsets = new Float32Array(count);
        const scales = new Float32Array(count);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random start positions (sphere distribution)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.random();

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Random offset for staggered spawning
            offsets[i] = Math.random();

            // Random scale
            scales[i] = 0.5 + Math.random();

            // Random velocity
            velocities[i * 3] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 1] = Math.random() * 2;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }

        return { positions, offsets, scales, velocities };
    }, [count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(colorStart) },
        uColorEnd: { value: new THREE.Color(colorEnd) },
        uSize: { value: size },
        uSizeVariation: { value: sizeVariation },
        uSpeed: { value: speed },
        uSpread: { value: spread },
        uGravity: { value: new THREE.Vector3(...gravity) },
        uTurbulence: { value: turbulence },
        uLifetime: { value: lifetime },
        uOpacity: { value: opacity },
        uSoft: { value: soft },
    }), [colorStart, colorEnd, size, sizeVariation, speed, spread, gravity, turbulence, lifetime, opacity, soft]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    const blendingMode = blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending;

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aOffset"
                    count={count}
                    array={offsets}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={count}
                    array={scales}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aVelocity"
                    count={count}
                    array={velocities}
                    itemSize={3}
                />
            </bufferGeometry>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                transparent={true}
                depthWrite={false}
                blending={blendingMode}
            />
        </points>
    );
}

export { particleVertexShader, particleFragmentShader };
