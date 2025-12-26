/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOLUMETRIC FOG - Atmospheric Depth Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium fog system:
 * - Exponential height fog
 * - Animated noise for movement
 * - Color gradient support
 * - Density control
 * - Light shaft integration
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── VOLUMETRIC FOG SHADER ─── */
const fogVertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fogFragmentShader = `
    uniform float uTime;
    uniform vec3 uFogColor;
    uniform vec3 uFogColorTop;
    uniform float uDensity;
    uniform float uHeight;
    uniform float uFalloff;
    uniform float uNoiseScale;
    uniform float uNoiseSpeed;
    uniform float uNoiseIntensity;
    uniform vec3 uCameraPosition;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
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
    
    void main() {
        // Distance-based fog
        float distanceToCamera = length(vWorldPosition - uCameraPosition);
        float distanceFog = 1.0 - exp(-distanceToCamera * uDensity * 0.01);
        
        // Height-based fog
        float heightFactor = (uHeight - vWorldPosition.y) / uFalloff;
        heightFactor = clamp(heightFactor, 0.0, 1.0);
        heightFactor = pow(heightFactor, 2.0);
        
        // Animated noise for movement
        vec2 noiseCoord = vWorldPosition.xz * uNoiseScale;
        noiseCoord += uTime * uNoiseSpeed;
        float noise = snoise(noiseCoord) * 0.5 + 0.5;
        noise = noise * uNoiseIntensity + (1.0 - uNoiseIntensity);
        
        // Combine fog factors
        float fogAmount = distanceFog * heightFactor * noise;
        fogAmount = clamp(fogAmount, 0.0, 1.0);
        
        // Color gradient based on height
        float colorMix = smoothstep(0.0, uHeight, vWorldPosition.y);
        vec3 fogColor = mix(uFogColor, uFogColorTop, colorMix);
        
        gl_FragColor = vec4(fogColor, fogAmount * uDensity);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function VolumetricFog({
    color = '#666688',
    colorTop = '#8888aa',
    density = 0.5,
    height = 10.0,
    falloff = 20.0,
    noiseScale = 0.1,
    noiseSpeed = 0.1,
    noiseIntensity = 0.3,
    size = 200
}) {
    const meshRef = useRef();
    const { camera } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(color) },
        uFogColorTop: { value: new THREE.Color(colorTop) },
        uDensity: { value: density },
        uHeight: { value: height },
        uFalloff: { value: falloff },
        uNoiseScale: { value: noiseScale },
        uNoiseSpeed: { value: noiseSpeed },
        uNoiseIntensity: { value: noiseIntensity },
        uCameraPosition: { value: new THREE.Vector3() },
    }), [color, colorTop, density, height, falloff, noiseScale, noiseSpeed, noiseIntensity]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
            meshRef.current.material.uniforms.uCameraPosition.value.copy(camera.position);
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, height / 2, 0]}>
            <planeGeometry args={[size, size, 1, 1]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={fogVertexShader}
                fragmentShader={fogFragmentShader}
                transparent={true}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
}

/* ─── FOG LAYER COMPONENT ─── */
export function FogLayer({ height = 0, density = 0.3, color = '#8888aa' }) {
    const meshRef = useRef();

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.opacity = density + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, height, 0]}>
            <planeGeometry args={[500, 500]} />
            <meshBasicMaterial
                color={color}
                transparent={true}
                opacity={density}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
}

/* ─── TEMPLE FOG ─── */
export function TempleFog() {
    return (
        <VolumetricFog
            color="#1a1510"
            colorTop="#2a2520"
            density={0.6}
            height={5.0}
            falloff={15.0}
            noiseScale={0.05}
            noiseSpeed={0.05}
            noiseIntensity={0.4}
        />
    );
}

/* ─── DIVINE FOG ─── */
export function DivineFog() {
    return (
        <VolumetricFog
            color="#ffeedd"
            colorTop="#ffffee"
            density={0.3}
            height={15.0}
            falloff={30.0}
            noiseScale={0.02}
            noiseSpeed={0.03}
            noiseIntensity={0.2}
        />
    );
}

export { fogVertexShader, fogFragmentShader };
