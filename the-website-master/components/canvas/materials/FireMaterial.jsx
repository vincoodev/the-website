/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIRE MATERIAL - Volumetric Procedural Fire
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Realistic fire rendering:
 * - Animated noise-based flames
 * - Color gradient from core to edge
 * - Flickering intensity
 * - Heat distortion
 * - Ember particles hint
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── FIRE SHADER ─── */
const fireVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fireFragmentShader = `
    uniform float uTime;
    uniform vec3 uCoreColor;
    uniform vec3 uMiddleColor;
    uniform vec3 uOuterColor;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uTurbulence;
    uniform float uFlickerSpeed;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Noise functions
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
    
    float fbm(vec2 p) {
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
        vec2 uv = vUv;
        
        // Base flame shape (narrower at top)
        float flameShape = 1.0 - uv.y;
        flameShape *= smoothstep(0.0, 0.3, 0.5 - abs(uv.x - 0.5));
        
        // Animated turbulence
        vec2 noiseCoord = uv * uTurbulence;
        noiseCoord.y -= uTime * uSpeed;
        
        float noise1 = fbm(noiseCoord);
        float noise2 = fbm(noiseCoord * 2.0 + 100.0);
        
        // Distort UV based on noise
        uv.x += noise1 * 0.1 * (1.0 - uv.y);
        
        // Create flame pattern
        float flame = flameShape;
        flame += noise1 * 0.3;
        flame += noise2 * 0.15;
        flame *= smoothstep(0.0, 0.5, flameShape);
        
        // Flickering
        float flicker = sin(uTime * uFlickerSpeed) * 0.1 + 0.9;
        flicker *= sin(uTime * uFlickerSpeed * 2.3) * 0.05 + 0.95;
        flicker *= sin(uTime * uFlickerSpeed * 0.7 + 3.14) * 0.05 + 0.95;
        flame *= flicker;
        
        // Color gradient based on flame intensity
        float colorMix = pow(flame, 0.8);
        vec3 fireColor = mix(uOuterColor, uMiddleColor, colorMix);
        fireColor = mix(fireColor, uCoreColor, pow(colorMix, 2.0));
        
        // Add white hot core
        fireColor = mix(fireColor, vec3(1.0, 0.95, 0.8), pow(colorMix, 4.0));
        
        // Alpha based on flame shape
        float alpha = flame * uIntensity;
        alpha = smoothstep(0.0, 0.3, alpha);
        
        // Edge softening
        alpha *= smoothstep(0.0, 0.1, uv.y);
        alpha *= smoothstep(1.0, 0.9, uv.y);
        
        gl_FragColor = vec4(fireColor * (1.0 + flame * 0.5), alpha);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function FireMaterial({
    coreColor = '#ffffff',
    middleColor = '#ffaa00',
    outerColor = '#ff4400',
    intensity = 1.0,
    speed = 1.5,
    turbulence = 3.0,
    flickerSpeed = 10.0
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uCoreColor: { value: new THREE.Color(coreColor) },
        uMiddleColor: { value: new THREE.Color(middleColor) },
        uOuterColor: { value: new THREE.Color(outerColor) },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uTurbulence: { value: turbulence },
        uFlickerSpeed: { value: flickerSpeed },
    }), [coreColor, middleColor, outerColor, intensity, speed, turbulence, flickerSpeed]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={fireVertexShader}
            fragmentShader={fireFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    );
}

/* ─── TORCH FIRE ─── */
export function TorchFireMaterial() {
    return (
        <FireMaterial
            coreColor="#ffffcc"
            middleColor="#ff8800"
            outerColor="#ff4400"
            intensity={1.2}
            speed={2.0}
            turbulence={4.0}
            flickerSpeed={15.0}
        />
    );
}

/* ─── DIVINE FIRE (Golden) ─── */
export function DivineFireMaterial() {
    return (
        <FireMaterial
            coreColor="#ffffff"
            middleColor="#ffd700"
            outerColor="#ff9900"
            intensity={1.5}
            speed={1.0}
            turbulence={2.5}
            flickerSpeed={8.0}
        />
    );
}

/* ─── CHAOS FIRE (Red/Purple) ─── */
export function ChaosFireMaterial() {
    return (
        <FireMaterial
            coreColor="#ff4444"
            middleColor="#aa0066"
            outerColor="#330022"
            intensity={1.3}
            speed={3.0}
            turbulence={6.0}
            flickerSpeed={20.0}
        />
    );
}

export { fireVertexShader, fireFragmentShader };
