/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOLOGRAPHIC MATERIAL - Iridescent Rainbow Display
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Futuristic holographic effect:
 * - Rainbow iridescence from viewing angle
 * - Scanline interference
 * - Flicker and glitch
 * - Transparency with depth
 * - Animated grid pattern
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── HOLOGRAPHIC SHADER ─── */
const holoVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const holoFragmentShader = `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform float uIridescence;
    uniform float uScanlineIntensity;
    uniform float uFlickerSpeed;
    uniform float uGridScale;
    uniform float uAlpha;
    uniform bool uGlitch;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    // Rainbow color from angle
    vec3 rainbow(float t) {
        t = fract(t);
        float r = abs(t * 6.0 - 3.0) - 1.0;
        float g = 2.0 - abs(t * 6.0 - 2.0);
        float b = 2.0 - abs(t * 6.0 - 4.0);
        return clamp(vec3(r, g, b), 0.0, 1.0);
    }
    
    // Random hash
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Fresnel-based iridescence
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        
        // Rainbow shift based on view angle and position
        float hue = fresnel + vWorldPosition.y * 0.1 + uTime * 0.1;
        vec3 iridescent = rainbow(hue) * uIridescence;
        
        // Scanlines
        float scanline = sin(vUv.y * 500.0 + uTime * 50.0) * 0.5 + 0.5;
        scanline = pow(scanline, 4.0) * uScanlineIntensity;
        
        // Horizontal scan bar
        float scanBar = smoothstep(0.0, 0.02, abs(fract(vUv.y - uTime * 0.2) - 0.5) - 0.48);
        scanBar = 1.0 - scanBar * 0.5;
        
        // Grid pattern
        vec2 grid = fract(vUv * uGridScale);
        float gridLine = step(0.95, grid.x) + step(0.95, grid.y);
        gridLine = min(gridLine, 1.0) * 0.3;
        
        // Flicker
        float flicker = sin(uTime * uFlickerSpeed) * 0.1 + 0.9;
        flicker *= sin(uTime * uFlickerSpeed * 3.7) * 0.05 + 0.95;
        
        // Glitch effect
        float glitchOffset = 0.0;
        if (uGlitch) {
            float glitchTrigger = step(0.98, hash(vec2(floor(uTime * 10.0), 0.0)));
            glitchOffset = glitchTrigger * (hash(vec2(vUv.y * 10.0, uTime)) - 0.5) * 0.2;
        }
        
        // Combine colors
        vec3 holoColor = uBaseColor + iridescent;
        holoColor = mix(holoColor, vec3(1.0), gridLine);
        holoColor = mix(holoColor, vec3(1.0), scanline * 0.3);
        holoColor *= scanBar;
        holoColor *= flicker;
        
        // Edge glow
        float edgeGlow = pow(fresnel, 3.0) * 0.5;
        holoColor += uBaseColor * edgeGlow;
        
        // Alpha calculation
        float alpha = uAlpha;
        alpha *= 0.5 + fresnel * 0.5; // More opaque at edges
        alpha *= flicker;
        alpha += gridLine * 0.3;
        
        gl_FragColor = vec4(holoColor, alpha);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function HolographicMaterial({
    color = '#00ffff',
    iridescence = 0.5,
    scanlineIntensity = 0.3,
    flickerSpeed = 5.0,
    gridScale = 20.0,
    alpha = 0.7,
    glitch = false
}) {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(color) },
        uIridescence: { value: iridescence },
        uScanlineIntensity: { value: scanlineIntensity },
        uFlickerSpeed: { value: flickerSpeed },
        uGridScale: { value: gridScale },
        uAlpha: { value: alpha },
        uGlitch: { value: glitch },
    }), [color, iridescence, scanlineIntensity, flickerSpeed, gridScale, alpha, glitch]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={holoVertexShader}
            fragmentShader={holoFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    );
}

/* ─── TERMINAL HOLOGRAM (Green) ─── */
export function TerminalHologramMaterial() {
    return (
        <HolographicMaterial
            color="#00ff41"
            iridescence={0.2}
            scanlineIntensity={0.5}
            flickerSpeed={8.0}
            gridScale={30.0}
            alpha={0.6}
            glitch={true}
        />
    );
}

/* ─── DIVINE HOLOGRAM (Gold) ─── */
export function DivineHologramMaterial() {
    return (
        <HolographicMaterial
            color="#ffd700"
            iridescence={0.8}
            scanlineIntensity={0.1}
            flickerSpeed={2.0}
            gridScale={10.0}
            alpha={0.8}
            glitch={false}
        />
    );
}

/* ─── DATA HOLOGRAM (Blue) ─── */
export function DataHologramMaterial() {
    return (
        <HolographicMaterial
            color="#00aaff"
            iridescence={0.4}
            scanlineIntensity={0.4}
            flickerSpeed={6.0}
            gridScale={25.0}
            alpha={0.65}
            glitch={true}
        />
    );
}

export { holoVertexShader, holoFragmentShader };
