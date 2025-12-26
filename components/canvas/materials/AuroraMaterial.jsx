/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AURORA MATERIAL - Northern Lights / Divine Glow
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ethereal aurora effect:
 * - Flowing curtain animation
 * - Color shifting bands
 * - Vertical wave motion
 * - Transparency gradients
 * - Divine atmosphere
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── AURORA SHADER ─── */
const auroraVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const auroraFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uSpeed;
    uniform float uWaveFrequency;
    uniform float uIntensity;
    uniform float uVerticalFade;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Noise
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
        vec2 uv = vUv;
        
        // Flowing wave distortion
        float wave1 = sin(uv.x * uWaveFrequency + uTime * uSpeed) * 0.1;
        float wave2 = sin(uv.x * uWaveFrequency * 2.0 - uTime * uSpeed * 0.7) * 0.05;
        float wave3 = sin(uv.x * uWaveFrequency * 0.5 + uTime * uSpeed * 0.3) * 0.15;
        
        float totalWave = wave1 + wave2 + wave3;
        
        // Noise for organic variation
        vec2 noiseCoord = vec2(uv.x * 2.0 + uTime * uSpeed * 0.2, uv.y);
        float noise = snoise(noiseCoord) * 0.5 + 0.5;
        
        // Create curtain bands
        float band1 = sin((uv.y + totalWave) * 10.0 + uTime * 0.5) * 0.5 + 0.5;
        float band2 = sin((uv.y + totalWave) * 15.0 - uTime * 0.3) * 0.5 + 0.5;
        float band3 = sin((uv.y + totalWave) * 7.0 + uTime * 0.7) * 0.5 + 0.5;
        
        band1 = pow(band1, 3.0);
        band2 = pow(band2, 4.0);
        band3 = pow(band3, 2.0);
        
        // Color mixing
        vec3 auroraColor = uColor1 * band1;
        auroraColor += uColor2 * band2;
        auroraColor += uColor3 * band3;
        auroraColor *= noise * 0.5 + 0.5;
        
        // Vertical fade (stronger at top, fading at bottom)
        float verticalFade = pow(uv.y, uVerticalFade);
        verticalFade *= smoothstep(0.0, 0.2, uv.y); // Soft bottom edge
        verticalFade *= smoothstep(1.0, 0.8, uv.y); // Soft top edge
        
        // Horizontal variation
        float horizontalVar = sin(uv.x * 3.14159 * 2.0) * 0.3 + 0.7;
        
        // Combine
        float alpha = (band1 + band2 + band3) * 0.3;
        alpha *= verticalFade;
        alpha *= horizontalVar;
        alpha *= noise * 0.5 + 0.5;
        alpha *= uIntensity;
        
        // Pulse
        float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
        alpha *= pulse;
        
        gl_FragColor = vec4(auroraColor, alpha);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function AuroraMaterial({
    color1 = '#00ff88',
    color2 = '#0088ff',
    color3 = '#ff00ff',
    speed = 0.3,
    waveFrequency = 5.0,
    intensity = 1.0,
    verticalFade = 0.5
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
        uSpeed: { value: speed },
        uWaveFrequency: { value: waveFrequency },
        uIntensity: { value: intensity },
        uVerticalFade: { value: verticalFade },
    }), [color1, color2, color3, speed, waveFrequency, intensity, verticalFade]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={auroraVertexShader}
            fragmentShader={auroraFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    );
}

/* ─── DIVINE AURORA (Golden) ─── */
export function DivineAuroraMaterial() {
    return (
        <AuroraMaterial
            color1="#ffd700"
            color2="#ffaa00"
            color3="#ffffff"
            speed={0.2}
            waveFrequency={4.0}
            intensity={1.2}
            verticalFade={0.3}
        />
    );
}

/* ─── COSMIC AURORA ─── */
export function CosmicAuroraMaterial() {
    return (
        <AuroraMaterial
            color1="#9966ff"
            color2="#00aaff"
            color3="#ff66cc"
            speed={0.15}
            waveFrequency={6.0}
            intensity={0.8}
            verticalFade={0.6}
        />
    );
}

export { auroraVertexShader, auroraFragmentShader };
