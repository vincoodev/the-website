/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PREMIUM 3D COMPONENTS - Master Index
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Central export for all premium Three.js components
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// POST-PROCESSING EFFECTS
// ═══════════════════════════════════════════════════════════════════════════
export { default as CustomBloom } from './effects/CustomBloom';
export { default as ChromaticAberration } from './effects/ChromaticAberration';
export { default as Vignette3D, AnimatedVignette } from './effects/Vignette3D';
export { default as FilmGrainOverlay, Scanlines } from './effects/FilmGrain3D';
export { default as GodRays, MultiGodRays, DivineRays } from './effects/GodRays';
export { default as GlitchEffect, ExtremeGlitch } from './effects/GlitchEffect';
export { default as DepthOfField, RadialBlur } from './effects/DepthOfField';
export { default as ColorGrading, COLOR_PRESETS } from './effects/ColorGrading';

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED MATERIALS
// ═══════════════════════════════════════════════════════════════════════════
export { default as GoldMaterial, useGoldMaterial } from './materials/GoldMaterial';
export { default as MarbleMaterial } from './materials/MarbleMaterial';
export { default as CrystalMaterial, DivineCrystalMaterial, IceCrystalMaterial } from './materials/CrystalMaterial';
export { default as EnergyMaterial, DivineEnergyMaterial, ChaosEnergyMaterial, DigitalEnergyMaterial, CosmicEnergyMaterial } from './materials/EnergyMaterial';
export { default as HolographicMaterial, TerminalHologramMaterial, DivineHologramMaterial, DataHologramMaterial } from './materials/HolographicMaterial';
export { default as WaterMaterial, DivineWaterMaterial, MysticalWaterMaterial } from './materials/WaterMaterial';
export { default as FireMaterial, TorchFireMaterial, DivineFireMaterial, ChaosFireMaterial } from './materials/FireMaterial';
export { default as AuroraMaterial, DivineAuroraMaterial, CosmicAuroraMaterial } from './materials/AuroraMaterial';
export { default as NebulaMaterial, CosmicNebulaMaterial, DivineNebulaMaterial } from './materials/NebulaMaterial';

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════
export { default as ProceduralSkybox, OlympusDaySky, OlympusDivineSky, CosmicNightSky, ChaosSky } from './environment/ProceduralSkybox';
export { default as VolumetricFog, FogLayer, TempleFog, DivineFog } from './environment/VolumetricFog';
export { default as useProceduralEnvMap, ReflectionPlane, ReflectionProbe, EnvironmentProvider, ReflectiveFloor } from './environment/EnvironmentReflections';
export { default as ContactShadow, GroundShadow, ColumnShadows } from './environment/AmbientOcclusion';

// ═══════════════════════════════════════════════════════════════════════════
// GPU PARTICLE SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════
export { default as GPUParticleSystem } from './particles/GPUParticleSystem';
export { default as MagicDust, DivineDust, CosmicDust } from './particles/MagicDust';
export { default as EnergyOrbs, DivineOrbs, ChaosOrbs, OmegaHaloOrbs } from './particles/EnergyOrbs';
export { default as SpiralParticles, OmegaRevealSpiral, SummonEffect } from './particles/SpiralParticles';
export { default as PortalParticles, DivinePortal, ChaosPortal } from './particles/PortalParticles';
export { default as AshEmbers, TorchEmbers, BonfireEmbers } from './particles/AshEmbers';
export { default as DataStream, MatrixRain, GoldenDataStream } from './particles/DataStream';

// ═══════════════════════════════════════════════════════════════════════════
// PROCEDURAL GEOMETRY
// ═══════════════════════════════════════════════════════════════════════════
export { default as ProceduralStatue, ZeusStatue, AthenaStatue, BrokenStatue } from './geometry/ProceduralStatue';
export { default as ProceduralMountain, MountOlympus } from './geometry/ProceduralMountain';
export { default as ProceduralWater, DivinePool, ReflectionPool } from './geometry/ProceduralWater';
export { default as ProceduralAltar, DivineAltar, ChaosAltar } from './geometry/ProceduralAltar';
export { default as ProceduralThrone, ZeusThrone, HadesThrone } from './geometry/ProceduralThrone';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════
export { default as CinematicCamera, ShakeSystem, OrbitCamera, DollyZoom, PhasedCamera } from './animation/CinematicCamera';
export { default as FadeTransition, FlashTransition, WipeTransition, DivineReveal } from './animation/TransitionManager';

// ═══════════════════════════════════════════════════════════════════════════
// EXISTING PROCEDURAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
export { default as ProceduralStars } from './procedural/ProceduralStars';
export { default as ProceduralClouds } from './procedural/ProceduralClouds';
export { default as ProceduralColumns } from './procedural/ProceduralColumns';
export { default as ProceduralOmega, SimpleOmega } from './procedural/ProceduralOmega';

// ═══════════════════════════════════════════════════════════════════════════
// SCENES
// ═══════════════════════════════════════════════════════════════════════════
export { default as LandingScene } from './scenes/LandingScene';
export { default as Puzzle1Scene } from './scenes/Puzzle1Scene';
export { default as Puzzle2Scene } from './scenes/Puzzle2Scene';
export { default as Puzzle3Scene } from './scenes/Puzzle3Scene';
export { default as FinishScene } from './scenes/FinishScene';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
export { default as CanvasWrapper } from './CanvasWrapper';
