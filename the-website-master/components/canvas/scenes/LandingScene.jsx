/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANDING SCENE - ULTRA PREMIUM 3D Experience
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * $10K USD Quality Standard:
 * - Dynamic HDR skybox with atmospheric scattering
 * - GPU particle systems (divine dust, spirals, orbs)
 * - Volumetric lighting and god rays
 * - Premium marble columns with gold accents
 * - Cinematic camera with phase-based behavior
 * - Advanced post-processing stack
 * - Divine aurora and energy effects
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Procedural components
import ProceduralStars from '../procedural/ProceduralStars';
import ProceduralClouds from '../procedural/ProceduralClouds';
import ProceduralColumns from '../procedural/ProceduralColumns';
import { SimpleOmega } from '../procedural/ProceduralOmega';

// Premium effects
import CustomBloom from '../effects/CustomBloom';
import ChromaticAberration from '../effects/ChromaticAberration';
import Vignette3D, { AnimatedVignette } from '../effects/Vignette3D';
import FilmGrainOverlay from '../effects/FilmGrain3D';
import GodRays, { DivineRays } from '../effects/GodRays';
import GlitchEffect from '../effects/GlitchEffect';

// Premium materials
import { DivineEnergyMaterial, ChaosEnergyMaterial } from '../materials/EnergyMaterial';
import { DivineAuroraMaterial } from '../materials/AuroraMaterial';

// Premium particles
import { DivineDust } from '../particles/MagicDust';
import { OmegaHaloOrbs, DivineOrbs } from '../particles/EnergyOrbs';
import { OmegaRevealSpiral } from '../particles/SpiralParticles';
import GPUParticleSystem from '../particles/GPUParticleSystem';

// Environment
import ProceduralSkybox, { CosmicNightSky, ChaosSky } from '../environment/ProceduralSkybox';
import { DivineFog, TempleFog } from '../environment/VolumetricFog';
import { ColumnShadows } from '../environment/AmbientOcclusion';

// Animation
import { PhasedCamera, ShakeSystem } from '../animation/CinematicCamera';
import { DivineReveal, FlashTransition } from '../animation/TransitionManager';

/* ─── DYNAMIC SKYBOX ─── */
function DynamicSkybox({ phase }) {
    const skySettings = useMemo(() => {
        switch (phase) {
            case 'calm':
                return {
                    sunPosition: [50, 30, 100],
                    skyColorTop: '#0a0a2e',
                    skyColorHorizon: '#1a1a3e',
                    sunColor: '#aaaaff',
                    stars: true,
                };
            case 'decay':
                return {
                    sunPosition: [30, 10, 100],
                    skyColorTop: '#1a0a1a',
                    skyColorHorizon: '#2a1020',
                    sunColor: '#ff6666',
                    stars: true,
                };
            case 'chaos':
                return {
                    sunPosition: [0, -20, 100],
                    skyColorTop: '#1a0000',
                    skyColorHorizon: '#2a0010',
                    sunColor: '#ff0000',
                    stars: false,
                };
            case 'revelation':
                return {
                    sunPosition: [0, 100, 0],
                    skyColorTop: '#1a1530',
                    skyColorHorizon: '#ffd700',
                    sunColor: '#ffffff',
                    sunSize: 15,
                    sunBloom: 5,
                    stars: true,
                };
            default:
                return {
                    sunPosition: [50, 30, 100],
                    skyColorTop: '#0a0a2e',
                    skyColorHorizon: '#1a1a3e',
                    stars: true,
                };
        }
    }, [phase]);

    return (
        <ProceduralSkybox
            sunPosition={skySettings.sunPosition}
            skyColorTop={skySettings.skyColorTop}
            skyColorHorizon={skySettings.skyColorHorizon}
            sunColor={skySettings.sunColor}
            sunSize={skySettings.sunSize || 5}
            sunBloom={skySettings.sunBloom || 2}
            stars={skySettings.stars}
            starDensity={phase === 'revelation' ? 2 : 1}
        />
    );
}

/* ─── ADVANCED LIGHTNING SYSTEM ─── */
function LightningSystem({ active = false }) {
    const [flash, setFlash] = useState(false);
    const [bolts, setBolts] = useState([]);

    useEffect(() => {
        if (!active) {
            setBolts([]);
            return;
        }

        const interval = setInterval(() => {
            const newBolts = [];
            const count = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < count; i++) {
                const points = [];
                let x = (Math.random() - 0.5) * 20;
                let y = 12;

                for (let j = 0; j < 10; j++) {
                    points.push(new THREE.Vector3(
                        x + (Math.random() - 0.5) * 1,
                        y,
                        (Math.random() - 0.5) * 3
                    ));
                    x += (Math.random() - 0.5) * 3;
                    y -= 2.4;
                }

                newBolts.push({ id: Date.now() + i, points });
            }

            setBolts(newBolts);
            setFlash(true);

            setTimeout(() => {
                setBolts([]);
                setFlash(false);
            }, 80);
        }, 500 + Math.random() * 1000);

        return () => clearInterval(interval);
    }, [active]);

    if (!active) return null;

    return (
        <group>
            {bolts.map((bolt) => (
                <line key={bolt.id}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={bolt.points.length}
                            array={new Float32Array(bolt.points.flatMap(p => [p.x, p.y, p.z]))}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#ffffff" linewidth={3} />
                </line>
            ))}

            {flash && (
                <>
                    <pointLight position={[0, 8, 5]} intensity={10} color="#ffffff" distance={50} />
                    <ambientLight intensity={2} color="#aaaaff" />
                </>
            )}
        </group>
    );
}

/* ─── COLUMN CONFIGURATIONS ─── */
const getColumnsForPhase = (phase) => {
    const baseColumns = [
        { position: [-8, -2, -5], height: 6, radius: 0.4 },
        { position: [-5, -1, -8], height: 7, radius: 0.35 },
        { position: [5, -1.5, -6], height: 5, radius: 0.45 },
        { position: [8, -2, -7], height: 6.5, radius: 0.4 },
        { position: [-3, 0, -12], height: 8, radius: 0.5 },
        { position: [4, -0.5, -10], height: 7.5, radius: 0.45 },
        // Additional columns for grandeur
        { position: [-10, -2.5, -10], height: 5.5, radius: 0.35 },
        { position: [10, -2.5, -9], height: 5.5, radius: 0.35 },
    ];

    if (phase === 'chaos') {
        return baseColumns.map((col, i) => ({
            ...col,
            position: [
                col.position[0] + Math.sin(i * 1.5) * 0.8,
                col.position[1] + Math.cos(i) * 0.5 - 0.3,
                col.position[2],
            ],
        }));
    }

    return baseColumns;
};

/* ─── PREMIUM OMEGA COMPONENT ─── */
function PremiumOmega({ visible }) {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current && visible) {
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
        }
    });

    if (!visible) return null;

    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
            <group ref={groupRef}>
                <SimpleOmega scale={2} position={[0, 0, 0]} color="#ffd700" />

                {/* Energy ring around omega */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.5, 0.05, 16, 64]} />
                    <meshBasicMaterial color="#ffd700" transparent opacity={0.6} />
                </mesh>

                {/* Outer glow ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[3, 0.03, 16, 64]} />
                    <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} />
                </mesh>
            </group>
        </Float>
    );
}

/* ─── MAIN SCENE ─── */
export default function LandingScene({
    phase = 'calm',
    onOmegaClick,
    omegaVisible = false
}) {
    const columns = useMemo(() => getColumnsForPhase(phase), [phase]);
    const columnPositions = useMemo(() => columns.map(c => c.position), [columns]);

    // Determine visual intensity based on phase
    const phaseConfig = useMemo(() => {
        switch (phase) {
            case 'calm':
                return {
                    bloom: 1.2, chromatic: 0.001, vignette: 0.3,
                    godRays: 0.3, glitch: false, shake: 0,
                };
            case 'decay':
                return {
                    bloom: 1.5, chromatic: 0.004, vignette: 0.45,
                    godRays: 0.2, glitch: false, shake: 0.02,
                };
            case 'chaos':
                return {
                    bloom: 2.5, chromatic: 0.012, vignette: 0.7,
                    godRays: 0, glitch: true, shake: 0.15,
                };
            case 'revelation':
                return {
                    bloom: 3.0, chromatic: 0.002, vignette: 0.2,
                    godRays: 1.5, glitch: false, shake: 0,
                };
            default:
                return {
                    bloom: 1.2, chromatic: 0.001, vignette: 0.3,
                    godRays: 0.3, glitch: false, shake: 0,
                };
        }
    }, [phase]);

    return (
        <>
            {/* Camera System */}
            <PhasedCamera phase={phase} />
            <ShakeSystem
                active={phase === 'chaos'}
                intensity={phaseConfig.shake}
                decay={0.92}
            />

            {/* Dynamic Sky */}
            <DynamicSkybox phase={phase} />

            {/* Stars - Enhanced */}
            <ProceduralStars
                count={phase === 'revelation' ? 10000 : 6000}
                radius={80}
                color={phase === 'revelation' ? '#ffd700' : '#ffffff'}
                minSize={phase === 'revelation' ? 0.8 : 0.5}
                maxSize={phase === 'revelation' ? 2.5 : 1.5}
            />

            {/* Volumetric Clouds */}
            <ProceduralClouds
                count={phase === 'chaos' ? 30 : 18}
                spread={[35, 12, 25]}
                basePosition={[0, 5, -15]}
                color={phase === 'chaos' ? '#1a0510' : '#ffffff'}
                glowColor={phase === 'revelation' ? '#ffd700' : '#8888ff'}
                opacity={phase === 'chaos' ? 0.7 : 0.35}
            />

            {/* Aurora (calm + revelation) */}
            {(phase === 'calm' || phase === 'revelation') && (
                <mesh position={[0, 15, -30]} rotation={[0.3, 0, 0]}>
                    <planeGeometry args={[60, 20]} />
                    <DivineAuroraMaterial />
                </mesh>
            )}

            {/* Fog Atmosphere */}
            {phase === 'revelation' && <DivineFog />}

            {/* Premium Columns */}
            <ProceduralColumns
                columns={columns}
                floating={phase !== 'calm'}
            />
            <ColumnShadows positions={columnPositions} intensity={0.3} />

            {/* Divine Dust Particles */}
            {phase === 'revelation' && <DivineDust position={[0, 0, 0]} />}

            {/* GPU Particle Rain (chaos phase) */}
            {phase === 'chaos' && (
                <GPUParticleSystem
                    count={500}
                    position={[0, 10, 0]}
                    colorStart="#ff2200"
                    colorEnd="#440000"
                    size={0.5}
                    speed={0.8}
                    gravity={[0, -0.5, 0]}
                    turbulence={0.3}
                    lifetime={4}
                />
            )}

            {/* Energy Orbs (revelation) */}
            {phase === 'revelation' && omegaVisible && (
                <OmegaHaloOrbs position={[0, 0, 0]} />
            )}

            {/* Omega Reveal Spiral (revelation) */}
            {phase === 'revelation' && omegaVisible && (
                <OmegaRevealSpiral active={true} position={[0, 0, 0]} />
            )}

            {/* Lightning (chaos) */}
            <LightningSystem active={phase === 'chaos'} />

            {/* Premium Omega Symbol */}
            <PremiumOmega visible={omegaVisible} onClick={onOmegaClick} />

            {/* Lighting Setup */}
            <ambientLight intensity={phase === 'chaos' ? 0.1 : 0.25} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={phase === 'revelation' ? 2.5 : 0.6}
                color={phase === 'revelation' ? '#ffd700' : '#ffffff'}
                castShadow
            />
            {phase === 'revelation' && (
                <pointLight position={[0, 3, 0]} intensity={5} color="#ffd700" distance={15} />
            )}

            {/* ═══ POST-PROCESSING EFFECTS ═══ */}

            {/* Bloom */}
            <CustomBloom
                intensity={phaseConfig.bloom}
                threshold={0.6}
                smoothing={0.4}
            />

            {/* Chromatic Aberration */}
            <ChromaticAberration
                offset={phaseConfig.chromatic}
                radialFalloff={true}
                animated={phase === 'chaos'}
            />

            {/* Vignette */}
            {phase === 'chaos' ? (
                <AnimatedVignette intensity={phaseConfig.vignette} pulseSpeed={3} />
            ) : (
                <Vignette3D intensity={phaseConfig.vignette} softness={0.5} />
            )}

            {/* Film Grain */}
            <FilmGrainOverlay
                intensity={0.08}
                animated={true}
                speed={phase === 'chaos' ? 3 : 1}
            />

            {/* God Rays (calm + revelation) */}
            {phaseConfig.godRays > 0 && (
                <GodRays
                    lightPosition={phase === 'revelation' ? [0.5, 0.3] : [0.7, 0.2]}
                    intensity={phaseConfig.godRays}
                    color={phase === 'revelation' ? '#ffd700' : '#ffffff'}
                />
            )}

            {/* Divine Rays (revelation only) */}
            {phase === 'revelation' && omegaVisible && (
                <DivineRays active={true} intensity={1.5} />
            )}

            {/* Glitch Effect (chaos) */}
            <GlitchEffect
                active={phaseConfig.glitch}
                intensity={0.7}
                blockSize={12}
            />

            {/* Divine Reveal Transition */}
            <DivineReveal active={phase === 'revelation' && omegaVisible} duration={2} />
        </>
    );
}
