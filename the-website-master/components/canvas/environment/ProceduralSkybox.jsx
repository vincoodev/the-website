/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL SKYBOX - Dynamic HDR Sky Environment
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium sky rendering:
 * - Atmospheric scattering
 * - Sun/moon positioning
 * - Day/night cycle support
 * - Horizon gradient
 * - Divine glow options
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── SKY SHADER ─── */
const skyVertexShader = `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const skyFragmentShader = `
    uniform float uTime;
    uniform vec3 uSunPosition;
    uniform vec3 uSkyColorTop;
    uniform vec3 uSkyColorHorizon;
    uniform vec3 uSunColor;
    uniform float uSunSize;
    uniform float uSunBloom;
    uniform float uAtmosphereIntensity;
    uniform bool uStars;
    uniform float uStarDensity;
    
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    // Hash for stars
    float hash(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    void main() {
        vec3 direction = normalize(vWorldPosition);
        
        // Base sky gradient
        float height = direction.y * 0.5 + 0.5;
        vec3 skyColor = mix(uSkyColorHorizon, uSkyColorTop, height);
        
        // Sun calculation
        vec3 sunDir = normalize(uSunPosition);
        float sunDot = max(dot(direction, sunDir), 0.0);
        
        // Sun disk
        float sunDisk = smoothstep(1.0 - uSunSize * 0.01, 1.0, sunDot);
        
        // Sun bloom/glow
        float sunBloom = pow(sunDot, 8.0 / uSunBloom) * uSunBloom;
        
        // Atmospheric scattering approximation
        float atmosphere = pow(max(1.0 - direction.y, 0.0), 3.0) * uAtmosphereIntensity;
        vec3 atmosphereColor = uSunColor * 0.3;
        
        // Combine sun effects
        vec3 sunEffect = uSunColor * sunDisk;
        sunEffect += uSunColor * sunBloom * 0.5;
        
        // Stars (only if enabled and sky is dark enough)
        vec3 starsColor = vec3(0.0);
        if (uStars) {
            float skyBrightness = dot(skyColor, vec3(0.299, 0.587, 0.114));
            float starVisibility = 1.0 - min(skyBrightness * 2.0, 1.0);
            
            if (starVisibility > 0.0) {
                vec3 starCoord = floor(direction * 200.0 * uStarDensity);
                float star = hash(starCoord);
                star = step(0.997, star);
                
                // Twinkle
                float twinkle = sin(uTime * 3.0 + star * 100.0) * 0.3 + 0.7;
                star *= twinkle;
                
                // Color variation
                vec3 starColor = vec3(1.0);
                float colorVar = hash(starCoord + 100.0);
                if (colorVar > 0.7) starColor = vec3(1.0, 0.9, 0.8);
                else if (colorVar > 0.4) starColor = vec3(0.9, 0.95, 1.0);
                
                starsColor = starColor * star * starVisibility;
            }
        }
        
        // Final composition
        vec3 finalColor = skyColor;
        finalColor += atmosphereColor * atmosphere;
        finalColor += sunEffect;
        finalColor += starsColor;
        
        // Horizon haze
        float horizonHaze = pow(1.0 - abs(direction.y), 8.0);
        finalColor = mix(finalColor, uSkyColorHorizon, horizonHaze * 0.3);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

/* ─── MAIN COMPONENT ─── */
export default function ProceduralSkybox({
    sunPosition = [100, 50, 100],
    skyColorTop = '#0a0a2e',
    skyColorHorizon = '#1a1a3e',
    sunColor = '#ffd700',
    sunSize = 5.0,
    sunBloom = 2.0,
    atmosphereIntensity = 0.5,
    stars = true,
    starDensity = 1.0,
    size = 500
}) {
    const meshRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSunPosition: { value: new THREE.Vector3(...sunPosition) },
        uSkyColorTop: { value: new THREE.Color(skyColorTop) },
        uSkyColorHorizon: { value: new THREE.Color(skyColorHorizon) },
        uSunColor: { value: new THREE.Color(sunColor) },
        uSunSize: { value: sunSize },
        uSunBloom: { value: sunBloom },
        uAtmosphereIntensity: { value: atmosphereIntensity },
        uStars: { value: stars },
        uStarDensity: { value: starDensity },
    }), [sunPosition, skyColorTop, skyColorHorizon, sunColor, sunSize, sunBloom, atmosphereIntensity, stars, starDensity]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} scale={[-1, 1, 1]}>
            <sphereGeometry args={[size, 64, 64]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={skyVertexShader}
                fragmentShader={skyFragmentShader}
                side={THREE.BackSide}
                depthWrite={false}
            />
        </mesh>
    );
}

/* ─── OLYMPUS SKY (Day) ─── */
export function OlympusDaySky() {
    return (
        <ProceduralSkybox
            sunPosition={[50, 100, 50]}
            skyColorTop="#87CEEB"
            skyColorHorizon="#f0e6d3"
            sunColor="#ffd700"
            sunSize={8.0}
            sunBloom={3.0}
            atmosphereIntensity={0.8}
            stars={false}
        />
    );
}

/* ─── OLYMPUS SKY (Divine) ─── */
export function OlympusDivineSky() {
    return (
        <ProceduralSkybox
            sunPosition={[0, 200, 0]}
            skyColorTop="#ffefd5"
            skyColorHorizon="#ffd700"
            sunColor="#ffffff"
            sunSize={20.0}
            sunBloom={5.0}
            atmosphereIntensity={1.0}
            stars={false}
        />
    );
}

/* ─── COSMIC SKY (Night) ─── */
export function CosmicNightSky() {
    return (
        <ProceduralSkybox
            sunPosition={[100, -50, 100]}
            skyColorTop="#000010"
            skyColorHorizon="#10102a"
            sunColor="#9999ff"
            sunSize={3.0}
            sunBloom={1.0}
            atmosphereIntensity={0.2}
            stars={true}
            starDensity={2.0}
        />
    );
}

/* ─── CHAOS SKY ─── */
export function ChaosSky() {
    return (
        <ProceduralSkybox
            sunPosition={[0, -100, 0]}
            skyColorTop="#1a0000"
            skyColorHorizon="#2a0010"
            sunColor="#ff0000"
            sunSize={50.0}
            sunBloom={8.0}
            atmosphereIntensity={0.5}
            stars={true}
            starDensity={0.5}
        />
    );
}

export { skyVertexShader, skyFragmentShader };
