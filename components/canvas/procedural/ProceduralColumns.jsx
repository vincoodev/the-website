/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL COLUMNS - Greek Doric Columns
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Custom BufferGeometry with fluting
 * - Marble material applied
 * - Instanced for performance
 * - Configurable dimensions
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MarbleMaterial from '../materials/MarbleMaterial';

/* ─── FLUTED CYLINDER GEOMETRY ─── */
function createFlutedCylinderGeometry(radius = 0.5, height = 5, flutes = 20, segments = 32) {
    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const fluteDepth = radius * 0.08;

    // Create vertices
    for (let y = 0; y <= segments; y++) {
        const v = y / segments;
        const py = v * height - height / 2;

        // Entasis (slight bulge in middle)
        const entasis = 1.0 + Math.sin(v * Math.PI) * 0.03;

        for (let x = 0; x <= flutes * 2; x++) {
            const u = x / (flutes * 2);
            const angle = u * Math.PI * 2;

            // Fluting depth varies
            const flutePhase = Math.cos(angle * flutes) * 0.5 + 0.5;
            const currentRadius = (radius - fluteDepth * flutePhase) * entasis;

            const px = Math.cos(angle) * currentRadius;
            const pz = Math.sin(angle) * currentRadius;

            positions.push(px, py, pz);

            // Normal
            const nx = Math.cos(angle);
            const nz = Math.sin(angle);
            normals.push(nx, 0, nz);

            uvs.push(u, v);
        }
    }

    // Create faces
    const vertsPerRow = flutes * 2 + 1;
    for (let y = 0; y < segments; y++) {
        for (let x = 0; x < flutes * 2; x++) {
            const a = y * vertsPerRow + x;
            const b = a + 1;
            const c = a + vertsPerRow;
            const d = c + 1;

            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

/* ─── COLUMN CAPITAL (TOP) ─── */
function ColumnCapital({ radius = 0.6, height = 0.3, position = [0, 0, 0] }) {
    return (
        <group position={position}>
            {/* Abacus (square top) */}
            <mesh position={[0, height * 0.5, 0]}>
                <boxGeometry args={[radius * 2.5, height * 0.3, radius * 2.5]} />
                <MarbleMaterial />
            </mesh>

            {/* Echinus (curved transition) */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[radius * 1.2, radius, height * 0.7, 32]} />
                <MarbleMaterial />
            </mesh>
        </group>
    );
}

/* ─── COLUMN BASE ─── */
function ColumnBase({ radius = 0.6, height = 0.2, position = [0, 0, 0] }) {
    return (
        <group position={position}>
            <mesh>
                <cylinderGeometry args={[radius, radius * 1.2, height, 32]} />
                <MarbleMaterial />
            </mesh>
        </group>
    );
}

/* ─── SINGLE COLUMN ─── */
function Column({
    position = [0, 0, 0],
    height = 6,
    radius = 0.4,
    flutes = 20,
    floating = false,
    floatSpeed = 1,
    floatAmplitude = 0.2
}) {
    const groupRef = useRef();
    const initialY = position[1];

    const flutedGeometry = useMemo(() =>
        createFlutedCylinderGeometry(radius, height, flutes, 48),
        [radius, height, flutes]
    );

    useFrame(({ clock }) => {
        if (groupRef.current && floating) {
            groupRef.current.position.y = initialY +
                Math.sin(clock.getElapsedTime() * floatSpeed) * floatAmplitude;
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Base */}
            <ColumnBase
                radius={radius * 1.3}
                height={height * 0.05}
                position={[0, -height / 2, 0]}
            />

            {/* Shaft */}
            <mesh geometry={flutedGeometry}>
                <MarbleMaterial />
            </mesh>

            {/* Capital */}
            <ColumnCapital
                radius={radius * 1.2}
                height={height * 0.08}
                position={[0, height / 2 + height * 0.04, 0]}
            />
        </group>
    );
}

/* ─── MAIN COMPONENT ─── */
export default function ProceduralColumns({
    columns = [],
    defaultHeight = 6,
    defaultRadius = 0.4,
    floating = false
}) {
    // Default arrangement if none provided
    const columnData = useMemo(() => {
        if (columns.length > 0) return columns;

        // Create classic temple front arrangement
        const result = [];
        const spacing = 3;
        const count = 6;

        for (let i = 0; i < count; i++) {
            result.push({
                position: [(i - (count - 1) / 2) * spacing, 0, 0],
                height: defaultHeight,
                radius: defaultRadius,
            });
        }

        return result;
    }, [columns, defaultHeight, defaultRadius]);

    return (
        <group>
            {columnData.map((col, index) => (
                <Column
                    key={index}
                    position={col.position}
                    height={col.height || defaultHeight}
                    radius={col.radius || defaultRadius}
                    floating={floating}
                    floatSpeed={0.5 + index * 0.1}
                    floatAmplitude={0.1 + index * 0.02}
                />
            ))}
        </group>
    );
}
