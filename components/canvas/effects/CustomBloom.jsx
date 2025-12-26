/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CUSTOM BLOOM EFFECT - Dual-Pass Gaussian Bloom
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium bloom effect without external dependencies:
 * - Brightness extraction pass
 * - Two-pass Gaussian blur (horizontal + vertical)
 * - HDR-ready with threshold control
 * - Additive blend with original scene
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── BRIGHTNESS EXTRACTION SHADER ─── */
const BrightnessShader = {
    uniforms: {
        tDiffuse: { value: null },
        threshold: { value: 0.8 },
        smoothWidth: { value: 0.1 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float threshold;
        uniform float smoothWidth;
        varying vec2 vUv;
        
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            
            // Calculate luminance
            float luminance = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
            
            // Soft threshold with smoothstep
            float brightness = smoothstep(threshold - smoothWidth, threshold + smoothWidth, luminance);
            
            // Extract bright areas
            gl_FragColor = vec4(texel.rgb * brightness, 1.0);
        }
    `
};

/* ─── GAUSSIAN BLUR SHADER ─── */
const GaussianBlurShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },
        direction: { value: new THREE.Vector2(1, 0) },
        blurSize: { value: 1.0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec2 direction;
        uniform float blurSize;
        varying vec2 vUv;
        
        // 9-tap Gaussian weights
        const float weights[5] = float[](
            0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216
        );
        
        void main() {
            vec2 texelSize = blurSize / resolution;
            vec3 result = texture2D(tDiffuse, vUv).rgb * weights[0];
            
            for(int i = 1; i < 5; i++) {
                vec2 offset = direction * texelSize * float(i);
                result += texture2D(tDiffuse, vUv + offset).rgb * weights[i];
                result += texture2D(tDiffuse, vUv - offset).rgb * weights[i];
            }
            
            gl_FragColor = vec4(result, 1.0);
        }
    `
};

/* ─── BLOOM COMPOSITE SHADER ─── */
const BloomCompositeShader = {
    uniforms: {
        tDiffuse: { value: null },
        tBloom: { value: null },
        bloomIntensity: { value: 1.0 },
        bloomTint: { value: new THREE.Color(1, 1, 1) },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tBloom;
        uniform float bloomIntensity;
        uniform vec3 bloomTint;
        varying vec2 vUv;
        
        void main() {
            vec4 original = texture2D(tDiffuse, vUv);
            vec4 bloom = texture2D(tBloom, vUv);
            
            // Additive blend with intensity and tint
            vec3 result = original.rgb + bloom.rgb * bloomIntensity * bloomTint;
            
            // Soft tone mapping to prevent oversaturation
            result = result / (result + vec3(1.0));
            
            gl_FragColor = vec4(result, original.a);
        }
    `
};

/* ─── CUSTOM BLOOM PASS CLASS ─── */
class CustomBloomPass {
    constructor(resolution, strength = 1, threshold = 0.8, radius = 1) {
        this.strength = strength;
        this.threshold = threshold;
        this.radius = radius;
        this.resolution = resolution;

        // Create render targets
        this.renderTargetBright = new THREE.WebGLRenderTarget(
            resolution.x / 2, resolution.y / 2,
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
        );

        this.renderTargetBlurH = new THREE.WebGLRenderTarget(
            resolution.x / 4, resolution.y / 4,
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
        );

        this.renderTargetBlurV = new THREE.WebGLRenderTarget(
            resolution.x / 4, resolution.y / 4,
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
        );

        // Create materials
        this.brightMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(BrightnessShader.uniforms),
            vertexShader: BrightnessShader.vertexShader,
            fragmentShader: BrightnessShader.fragmentShader,
        });

        this.blurMaterialH = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(GaussianBlurShader.uniforms),
            vertexShader: GaussianBlurShader.vertexShader,
            fragmentShader: GaussianBlurShader.fragmentShader,
        });

        this.blurMaterialV = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(GaussianBlurShader.uniforms),
            vertexShader: GaussianBlurShader.vertexShader,
            fragmentShader: GaussianBlurShader.fragmentShader,
        });

        this.compositeMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(BloomCompositeShader.uniforms),
            vertexShader: BloomCompositeShader.vertexShader,
            fragmentShader: BloomCompositeShader.fragmentShader,
        });

        // Full screen quad
        this.quad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.brightMaterial
        );
        this.scene = new THREE.Scene();
        this.scene.add(this.quad);
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    render(renderer, readBuffer, writeBuffer) {
        // Pass 1: Extract bright areas
        this.brightMaterial.uniforms.tDiffuse.value = readBuffer.texture;
        this.brightMaterial.uniforms.threshold.value = this.threshold;
        this.quad.material = this.brightMaterial;
        renderer.setRenderTarget(this.renderTargetBright);
        renderer.render(this.scene, this.camera);

        // Pass 2: Horizontal blur
        this.blurMaterialH.uniforms.tDiffuse.value = this.renderTargetBright.texture;
        this.blurMaterialH.uniforms.direction.value.set(1, 0);
        this.blurMaterialH.uniforms.resolution.value.set(this.resolution.x / 4, this.resolution.y / 4);
        this.blurMaterialH.uniforms.blurSize.value = this.radius;
        this.quad.material = this.blurMaterialH;
        renderer.setRenderTarget(this.renderTargetBlurH);
        renderer.render(this.scene, this.camera);

        // Pass 3: Vertical blur
        this.blurMaterialV.uniforms.tDiffuse.value = this.renderTargetBlurH.texture;
        this.blurMaterialV.uniforms.direction.value.set(0, 1);
        this.blurMaterialV.uniforms.resolution.value.set(this.resolution.x / 4, this.resolution.y / 4);
        this.blurMaterialV.uniforms.blurSize.value = this.radius;
        this.quad.material = this.blurMaterialV;
        renderer.setRenderTarget(this.renderTargetBlurV);
        renderer.render(this.scene, this.camera);

        // Pass 4: Composite
        this.compositeMaterial.uniforms.tDiffuse.value = readBuffer.texture;
        this.compositeMaterial.uniforms.tBloom.value = this.renderTargetBlurV.texture;
        this.compositeMaterial.uniforms.bloomIntensity.value = this.strength;
        this.quad.material = this.compositeMaterial;
        renderer.setRenderTarget(writeBuffer);
        renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.renderTargetBright.dispose();
        this.renderTargetBlurH.dispose();
        this.renderTargetBlurV.dispose();
        this.brightMaterial.dispose();
        this.blurMaterialH.dispose();
        this.blurMaterialV.dispose();
        this.compositeMaterial.dispose();
    }
}

/* ─── REACT COMPONENT ─── */
export default function CustomBloom({
    intensity = 1.5,
    threshold = 0.7,
    radius = 1.0,
    tint = '#ffffff'
}) {
    const { gl, size, scene, camera } = useThree();
    const bloomPassRef = useRef(null);
    const renderTargetRef = useRef(null);

    // Create bloom pass
    useEffect(() => {
        const resolution = new THREE.Vector2(size.width, size.height);
        bloomPassRef.current = new CustomBloomPass(resolution, intensity, threshold, radius);

        renderTargetRef.current = new THREE.WebGLRenderTarget(
            size.width, size.height,
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
        );

        return () => {
            if (bloomPassRef.current) {
                bloomPassRef.current.dispose();
            }
            if (renderTargetRef.current) {
                renderTargetRef.current.dispose();
            }
        };
    }, [size, intensity, threshold, radius]);

    // Update tint color
    useEffect(() => {
        if (bloomPassRef.current) {
            bloomPassRef.current.compositeMaterial.uniforms.bloomTint.value.set(tint);
        }
    }, [tint]);

    useFrame(() => {
        if (!bloomPassRef.current || !renderTargetRef.current) return;

        // Render scene to target
        gl.setRenderTarget(renderTargetRef.current);
        gl.render(scene, camera);

        // Apply bloom
        bloomPassRef.current.render(gl, renderTargetRef.current, null);

        gl.setRenderTarget(null);
    }, 1);

    return null;
}

export { CustomBloomPass, BrightnessShader, GaussianBlurShader, BloomCompositeShader };
