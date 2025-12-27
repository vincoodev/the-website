/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL MOUNTAIN - Mount Olympus Backdrop
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Majestic mountain range:
 * - Noise-displaced terrain
 * - Snow-capped peaks
 * - Atmospheric perspective
 * - Divine glow option
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── MOUNTAIN SHADER ─── */
const mountainVertexShader = `
    uniform float uTime;
    uniform float uHeightScale;
    uniform float uNoiseScale;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                          -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
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
    
    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for(int i = 0; i < 5; i++) {
            value += amplitude * snoise(p);
            p *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }
    
    void main() {
        vec3 pos = position;
        
        // Generate height from noise
        vec2 noiseCoord = position.xz * uNoiseScale;
        float height = fbm(noiseCoord);
        
        // Create peaks
        height = pow(max(height * 0.5 + 0.5, 0.0), 1.5);
        
        // Apply height
        pos.y = height * uHeightScale;
        vHeight = pos.y / uHeightScale;
        
        vPosition = pos;
        vNormal = normalize(normalMatrix * normal);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const mountainFragmentShader = `
    uniform vec3 uRockColor;
    uniform vec3 uSnowColor;
    uniform vec3 uGrassColor;
    uniform float uSnowLine;
    uniform float uFogAmount;
    uniform vec3 uFogColor;
    uniform bool uDivineGlow;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    void main() {
        // Color based on height
        vec3 color = uGrassColor;
        
        // Rock at mid heights
        float rockBlend = smoothstep(0.3, 0.5, vHeight);
        color = mix(color, uRockColor, rockBlend);
        
        // Snow at peaks
        float snowBlend = smoothstep(uSnowLine - 0.1, uSnowLine + 0.1, vHeight);
        color = mix(color, uSnowColor, snowBlend);
        
        // Simple lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
        float light = max(dot(vNormal, lightDir), 0.2);
        color *= light;
        
        // Divine glow at peak
        if (uDivineGlow) {
            float glow = pow(max(vHeight - 0.8, 0.0) * 5.0, 2.0);
            color += vec3(1.0, 0.95, 0.8) * glow * 0.5;
        }
        
        // Atmospheric fog
        float depth = length(vPosition) * 0.01;
        float fog = 1.0 - exp(-depth * uFogAmount);
        color = mix(color, uFogColor, fog);
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

export default function ProceduralMountain({
    position = [0, -10, -50],
    scale = [100, 30, 50],
    resolution = 64,
    rockColor = '#5a5045',
    snowColor = '#ffffff',
    grassColor = '#3a4a35',
    snowLine = 0.7,
    fogAmount = 0.3,
    fogColor = '#8888aa',
    divineGlow = false
}) {
    const meshRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uHeightScale: { value: 1.0 },
        uNoiseScale: { value: 0.02 },
        uRockColor: { value: new THREE.Color(rockColor) },
        uSnowColor: { value: new THREE.Color(snowColor) },
        uGrassColor: { value: new THREE.Color(grassColor) },
        uSnowLine: { value: snowLine },
        uFogAmount: { value: fogAmount },
        uFogColor: { value: new THREE.Color(fogColor) },
        uDivineGlow: { value: divineGlow },
    }), [rockColor, snowColor, grassColor, snowLine, fogAmount, fogColor, divineGlow]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <planeGeometry args={[2, 2, resolution, resolution]} rotation={[-Math.PI / 2, 0, 0]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={mountainVertexShader}
                fragmentShader={mountainFragmentShader}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

/* ─── MOUNT OLYMPUS ─── */
export function MountOlympus({ position = [0, -15, -80] }) {
    return (
        <ProceduralMountain
            position={position}
            scale={[150, 50, 80]}
            resolution={128}
            rockColor="#6a6055"
            snowColor="#fffafa"
            grassColor="#4a5a45"
            snowLine={0.6}
            fogAmount={0.2}
            fogColor="#d4c8b8"
            divineGlow={true}
        />
    );
}

export { mountainVertexShader, mountainFragmentShader };
