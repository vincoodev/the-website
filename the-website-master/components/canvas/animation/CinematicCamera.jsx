/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CINEMATIC CAMERA - Advanced Camera Controller
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Professional camera system:
 * - Smooth interpolation
 * - Path-based animation
 * - Shake effects
 * - Focus tracking
 * - Dolly/zoom
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── CAMERA STATE CONTROLLER ─── */
export default function CinematicCamera({
    position = [0, 0, 10],
    target = [0, 0, 0],
    fov = 50,
    smoothing = 0.05,
    enabled = true
}) {
    const { camera } = useThree();
    const targetPosition = useRef(new THREE.Vector3(...position));
    const targetLookAt = useRef(new THREE.Vector3(...target));

    useEffect(() => {
        targetPosition.current.set(...position);
        targetLookAt.current.set(...target);
    }, [position, target]);

    useFrame(() => {
        if (!enabled) return;

        // Smooth position interpolation
        camera.position.lerp(targetPosition.current, smoothing);

        // Smooth look-at
        const currentLookAt = new THREE.Vector3();
        camera.getWorldDirection(currentLookAt);
        currentLookAt.add(camera.position);

        currentLookAt.lerp(targetLookAt.current, smoothing);
        camera.lookAt(targetLookAt.current);

        // Update FOV smoothly
        if (camera.fov !== fov) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, fov, smoothing);
            camera.updateProjectionMatrix();
        }
    });

    return null;
}

/* ─── CAMERA SHAKE SYSTEM ─── */
export function ShakeSystem({
    intensity = 1.0,
    decay = 0.95,
    maxOffset = 0.5,
    active = false
}) {
    const { camera } = useThree();
    const shakeOffset = useRef(new THREE.Vector3());
    const currentIntensity = useRef(0);

    useEffect(() => {
        if (active) {
            currentIntensity.current = intensity;
        }
    }, [active, intensity]);

    useFrame(() => {
        if (currentIntensity.current > 0.01) {
            // Random shake offset
            shakeOffset.current.set(
                (Math.random() - 0.5) * 2 * currentIntensity.current * maxOffset,
                (Math.random() - 0.5) * 2 * currentIntensity.current * maxOffset,
                (Math.random() - 0.5) * 2 * currentIntensity.current * maxOffset * 0.5
            );

            camera.position.add(shakeOffset.current);

            // Decay shake
            currentIntensity.current *= decay;
        }
    });

    return null;
}

/* ─── ORBIT CAMERA ─── */
export function OrbitCamera({
    center = [0, 0, 0],
    distance = 10,
    height = 5,
    speed = 0.2,
    enabled = true
}) {
    const { camera } = useThree();

    useFrame(({ clock }) => {
        if (!enabled) return;

        const t = clock.getElapsedTime() * speed;

        camera.position.x = center[0] + Math.cos(t) * distance;
        camera.position.y = center[1] + height;
        camera.position.z = center[2] + Math.sin(t) * distance;

        camera.lookAt(center[0], center[1], center[2]);
    });

    return null;
}

/* ─── DOLLY ZOOM (Vertigo effect) ─── */
export function DollyZoom({
    targetDistance = 5,
    speed = 0.5,
    active = false
}) {
    const { camera } = useThree();
    const initialFov = useRef(camera.fov);
    const initialDistance = useRef(10);

    useEffect(() => {
        if (active) {
            initialFov.current = camera.fov;
            initialDistance.current = camera.position.length();
        }
    }, [active, camera]);

    useFrame(({ clock }) => {
        if (!active) return;

        const t = Math.sin(clock.getElapsedTime() * speed) * 0.5 + 0.5;
        const distance = THREE.MathUtils.lerp(initialDistance.current, targetDistance, t);

        // Adjust FOV to keep subject same size
        const fov = 2 * Math.atan(initialDistance.current / distance * Math.tan(initialFov.current * Math.PI / 360)) * 180 / Math.PI;

        camera.position.normalize().multiplyScalar(distance);
        camera.fov = fov;
        camera.updateProjectionMatrix();
    });

    return null;
}

/* ─── PHASE-BASED CAMERA ─── */
export function PhasedCamera({ phase = 'calm' }) {
    const { camera } = useThree();

    const phaseSettings = {
        calm: { position: [0, 0, 12], shake: 0 },
        decay: { position: [0, 1, 11], shake: 0.02 },
        chaos: { position: [0, 2, 10], shake: 0.1 },
        revelation: { position: [0, 0, 6], shake: 0 },
    };

    const settings = phaseSettings[phase] || phaseSettings.calm;

    useFrame(({ clock }) => {
        const target = new THREE.Vector3(...settings.position);
        camera.position.lerp(target, 0.02);

        // Add shake for chaos
        if (settings.shake > 0) {
            camera.position.x += (Math.random() - 0.5) * settings.shake;
            camera.position.y += (Math.random() - 0.5) * settings.shake;
        }

        camera.lookAt(0, 0, 0);
    });

    return null;
}
