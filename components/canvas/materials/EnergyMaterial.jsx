/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENERGY MATERIAL - Divine/Magical Energy Flow
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Mystical energy visualization:
 * - Flowing energy patterns
 * - Pulsating glow
 * - Electric arc effects
 * - Color shifting
 * - Particle trail simulation
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── ENERGY SHADER ─── */
const energyVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const energyFragmentShader = `
    uniform float uTime;
    uniform vec3 uPrimaryColor;
    uniform vec3 uSecondaryColor;
    uniform float uFlowSpeed;
    uniform float uPulseSpeed;
    uniform float uIntensity;
    uniform float uNoiseScale;
    uniform bool uElectric;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Simplex noise
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
    
    // Fractal noise
    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for(int i = 0; i < 4; i++) {
            value += amplitude * snoise(p);
            p *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Fresnel for edge glow
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.0);
        
        // Flowing energy pattern
        vec2 flowUV = vUv * uNoiseScale;
        flowUV.x += uTime * uFlowSpeed;
        flowUV.y += sin(uTime * 0.5 + vUv.x * 3.0) * 0.1;
        
        float flow = fbm(flowUV);
        flow = (flow + 1.0) * 0.5; // Normalize to 0-1
        
        // Pulsating intensity
        float pulse = sin(uTime * uPulseSpeed) * 0.3 + 0.7;
        
        // Core energy pattern
        float energyCore = pow(flow, 2.0) * pulse;
        
        // Electric arcs
        float arcs = 0.0;
        if (uElectric) {
            vec2 arcUV = vUv * 10.0;
            arcUV.x += uTime * 5.0;
            float arc1 = snoise(arcUV);
            float arc2 = snoise(arcUV * 2.0 + 100.0);
            arcs = pow(max(arc1 + arc2, 0.0), 10.0);
        }
        
        // Color mixing based on energy level
        float colorMix = energyCore + fresnel * 0.5;
        vec3 energyColor = mix(uSecondaryColor, uPrimaryColor, colorMix);
        
        // Add white hot center
        energyColor = mix(energyColor, vec3(1.0), pow(energyCore, 3.0) * 0.5);
        
        // Add electric arcs
        energyColor += vec3(1.0) * arcs;
        
        // Final intensity
        float alpha = (energyCore * 0.8 + fresnel * 0.5 + arcs) * uIntensity;
        alpha = clamp(alpha, 0.0, 1.0);
        
        // Emissive output
        vec3 finalColor = energyColor * (1.0 + energyCore);
        
        gl_FragColor = vec4(finalColor, alpha);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function EnergyMaterial({
    primaryColor = '#ffd700',
    secondaryColor = '#ff8800',
    flowSpeed = 0.5,
    pulseSpeed = 2.0,
    intensity = 1.0,
    noiseScale = 3.0,
    electric = false
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uPrimaryColor: { value: new THREE.Color(primaryColor) },
        uSecondaryColor: { value: new THREE.Color(secondaryColor) },
        uFlowSpeed: { value: flowSpeed },
        uPulseSpeed: { value: pulseSpeed },
        uIntensity: { value: intensity },
        uNoiseScale: { value: noiseScale },
        uElectric: { value: electric },
    }), [primaryColor, secondaryColor, flowSpeed, pulseSpeed, intensity, noiseScale, electric]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={energyVertexShader}
            fragmentShader={energyFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    );
}

/* ─── DIVINE ENERGY (Golden) ─── */
export function DivineEnergyMaterial({ intensity = 1.5 }) {
    return (
        <EnergyMaterial
            primaryColor="#ffd700"
            secondaryColor="#ff9500"
            flowSpeed={0.3}
            pulseSpeed={1.5}
            intensity={intensity}
            noiseScale={4.0}
            electric={false}
        />
    );
}

/* ─── CHAOS ENERGY (Red/Black) ─── */
export function ChaosEnergyMaterial({ intensity = 1.2 }) {
    return (
        <EnergyMaterial
            primaryColor="#ff0000"
            secondaryColor="#330000"
            flowSpeed={1.0}
            pulseSpeed={4.0}
            intensity={intensity}
            noiseScale={6.0}
            electric={true}
        />
    );
}

/* ─── DIGITAL ENERGY (Matrix Green) ─── */
export function DigitalEnergyMaterial({ intensity = 1.0 }) {
    return (
        <EnergyMaterial
            primaryColor="#00ff41"
            secondaryColor="#003300"
            flowSpeed={2.0}
            pulseSpeed={8.0}
            intensity={intensity}
            noiseScale={8.0}
            electric={true}
        />
    );
}

/* ─── COSMIC ENERGY (Purple) ─── */
export function CosmicEnergyMaterial({ intensity = 1.0 }) {
    return (
        <EnergyMaterial
            primaryColor="#9966ff"
            secondaryColor="#4a2080"
            flowSpeed={0.2}
            pulseSpeed={1.0}
            intensity={intensity}
            noiseScale={3.0}
            electric={false}
        />
    );
}

export { energyVertexShader, energyFragmentShader };
