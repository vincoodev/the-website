/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT REFLECTIONS - Screen Space Reflections Approximation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium reflection system:
 * - Procedural environment map
 * - Reflection probe support
 * - Fresnel-based blending
 * - Dynamic updates
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── PROCEDURAL ENVIRONMENT MAP ─── */
export function useProceduralEnvMap(options = {}) {
    const {
        skyColorTop = '#0a0a2e',
        skyColorHorizon = '#1a1a3e',
        groundColor = '#1a1510',
        sunColor = '#ffd700',
        sunPosition = [1, 0.5, 1],
        resolution = 256
    } = options;

    const envMap = useMemo(() => {
        // Create a simple gradient environment
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution / 2;
        const ctx = canvas.getContext('2d');

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
        skyGradient.addColorStop(0, skyColorTop);
        skyGradient.addColorStop(1, skyColorHorizon);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

        // Ground gradient
        const groundGradient = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
        groundGradient.addColorStop(0, skyColorHorizon);
        groundGradient.addColorStop(1, groundColor);
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        // Sun glow
        const sunX = (sunPosition[0] * 0.5 + 0.5) * canvas.width;
        const sunY = (1 - (sunPosition[1] * 0.5 + 0.5)) * canvas.height * 0.5;
        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
        sunGradient.addColorStop(0, sunColor);
        sunGradient.addColorStop(0.2, sunColor + '88');
        sunGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;

        return texture;
    }, [skyColorTop, skyColorHorizon, groundColor, sunColor, sunPosition, resolution]);

    return envMap;
}

/* ─── REFLECTION PLANE ─── */
export function ReflectionPlane({
    position = [0, 0, 0],
    size = [20, 20],
    color = '#1a1a1a',
    reflectivity = 0.5,
    roughness = 0.3,
    metalness = 0.8
}) {
    const meshRef = useRef();
    const envMap = useProceduralEnvMap({});

    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={size} />
            <meshStandardMaterial
                color={color}
                envMap={envMap}
                envMapIntensity={reflectivity}
                roughness={roughness}
                metalness={metalness}
            />
        </mesh>
    );
}

/* ─── REFLECTION SPHERE (Environment Probe) ─── */
export function ReflectionProbe({
    position = [0, 0, 0],
    size = 0.5,
    visible = false
}) {
    const envMap = useProceduralEnvMap({});

    if (!visible) return null;

    return (
        <mesh position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                color="#ffffff"
                envMap={envMap}
                envMapIntensity={1.0}
                roughness={0}
                metalness={1}
            />
        </mesh>
    );
}

/* ─── SCENE ENVIRONMENT PROVIDER ─── */
export function EnvironmentProvider({
    children,
    preset = 'olympus',
    intensity = 1.0
}) {
    const { scene } = useThree();

    const presets = {
        olympus: {
            skyColorTop: '#87CEEB',
            skyColorHorizon: '#ffeedd',
            groundColor: '#d4af37',
            sunColor: '#ffd700',
            sunPosition: [1, 0.8, 0.5],
        },
        cosmic: {
            skyColorTop: '#000010',
            skyColorHorizon: '#1a1040',
            groundColor: '#0a0a20',
            sunColor: '#9966ff',
            sunPosition: [0, 0.2, 1],
        },
        temple: {
            skyColorTop: '#1a1510',
            skyColorHorizon: '#2a2015',
            groundColor: '#0a0805',
            sunColor: '#ff6600',
            sunPosition: [0.5, 0.3, 1],
        },
        divine: {
            skyColorTop: '#ffffee',
            skyColorHorizon: '#ffd700',
            groundColor: '#fff8e0',
            sunColor: '#ffffff',
            sunPosition: [0, 1, 0],
        },
        matrix: {
            skyColorTop: '#001100',
            skyColorHorizon: '#002200',
            groundColor: '#000a00',
            sunColor: '#00ff41',
            sunPosition: [0, 0.5, 1],
        },
    };

    const envMap = useProceduralEnvMap(presets[preset] || presets.olympus);

    useEffect(() => {
        scene.environment = envMap;
        scene.environment.intensity = intensity;

        return () => {
            scene.environment = null;
        };
    }, [scene, envMap, intensity]);

    return <>{children}</>;
}

/* ─── REFLECTIVE FLOOR ─── */
export function ReflectiveFloor({
    size = 50,
    color = '#1a1a1a',
    reflectivity = 0.6,
    opacity = 0.95
}) {
    const meshRef = useRef();
    const envMap = useProceduralEnvMap({
        skyColorTop: '#2a2a3a',
        skyColorHorizon: '#1a1a2a',
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[size, size]} />
            <meshPhysicalMaterial
                color={color}
                envMap={envMap}
                envMapIntensity={reflectivity}
                roughness={0.1}
                metalness={0.9}
                transparent={true}
                opacity={opacity}
                reflectivity={1}
            />
        </mesh>
    );
}

export { useProceduralEnvMap as default };
