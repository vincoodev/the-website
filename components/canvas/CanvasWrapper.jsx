/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CANVAS WRAPPER - React Three Fiber Container
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HIGH QUALITY Configuration:
 * - MSAA antialiasing (4 samples)
 * - High DPI rendering
 * - Linear color space
 * - Soft shadows enabled
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';

/* ─── LOADING FALLBACK ─── */
function CanvasLoader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-olympus-gold/30 border-t-olympus-gold rounded-full animate-spin mx-auto mb-4" />
                <p className="text-olympus-gold font-display text-xl tracking-widest animate-pulse">
                    LOADING OLYMPUS
                </p>
            </div>
        </div>
    );
}

/* ─── MAIN CANVAS WRAPPER ─── */
export default function CanvasWrapper({
    children,
    camera = { position: [0, 0, 10], fov: 50 },
    className = "",
    quality = "high", // "high" | "medium" | "low"
    enablePostProcessing = true
}) {
    const containerRef = useRef(null);
    const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);
    const [dpr, setDpr] = useState(1);

    /* ─── CHECK WEBGL SUPPORT ─── */
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (!gl) {
                setIsWebGLAvailable(false);
            }
        } catch (e) {
            setIsWebGLAvailable(false);
        }

        // Set DPR based on quality setting
        const baseDpr = window.devicePixelRatio || 1;
        switch (quality) {
            case 'high':
                setDpr(Math.min(baseDpr, 2)); // Cap at 2x for performance
                break;
            case 'medium':
                setDpr(Math.min(baseDpr, 1.5));
                break;
            case 'low':
                setDpr(1);
                break;
            default:
                setDpr(Math.min(baseDpr, 2));
        }
    }, [quality]);

    /* ─── FALLBACK FOR NO WEBGL ─── */
    if (!isWebGLAvailable) {
        return (
            <div className={`absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black ${className}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/50 font-mono text-sm">
                        3D not supported on this device
                    </p>
                </div>
            </div>
        );
    }

    /* ─── HIGH QUALITY GL SETTINGS ─── */
    const glSettings = {
        antialias: quality === 'high',
        alpha: true,
        powerPreference: quality === 'high' ? 'high-performance' : 'default',
        stencil: false,
        depth: true,
        // Preserve drawing buffer for screenshots
        preserveDrawingBuffer: false,
    };

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 ${className}`}
            style={{ touchAction: 'none' }}
        >
            <Suspense fallback={<CanvasLoader />}>
                <Canvas
                    gl={glSettings}
                    dpr={dpr}
                    camera={camera}
                    shadows={quality !== 'low' ? 'soft' : false}
                    onCreated={({ gl, scene }) => {
                        // HIGH QUALITY: Linear color space
                        gl.outputColorSpace = THREE.SRGBColorSpace;
                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.2;

                        // Scene fog for depth
                        scene.fog = new THREE.FogExp2('#000000', 0.02);
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {children}
                    <Preload all />
                </Canvas>
            </Suspense>
        </div>
    );
}
