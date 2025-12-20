/**
 * Texture and Material Helpers
 * Utilities for working with Three.js textures and materials
 */

import * as THREE from 'three';

/**
 * Create a gradient texture
 */
export function createGradientTexture(
  colors: string[],
  width: number = 256,
  height: number = 256,
  vertical: boolean = true
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  const gradient = vertical
    ? ctx.createLinearGradient(0, 0, 0, height)
    : ctx.createLinearGradient(0, 0, width, 0);

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

/**
 * Create a noise texture
 */
export function createNoiseTexture(
  width: number = 256,
  height: number = 256,
  scale: number = 1
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.random() * 255 * scale;
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

/**
 * Create a pattern texture
 */
export function createPatternTexture(
  pattern: 'dots' | 'stripes' | 'checkerboard' | 'grid',
  color1: string = '#ffffff',
  color2: string = '#000000',
  size: number = 256
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;

  switch (pattern) {
    case 'dots': {
      ctx.fillStyle = color2;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = color1;
      const dotSize = size / 8;
      for (let x = 0; x < size; x += size / 4) {
        for (let y = 0; y < size; y += size / 4) {
          ctx.beginPath();
          ctx.arc(x + dotSize, y + dotSize, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'stripes': {
      const stripeWidth = size / 8;
      for (let i = 0; i < size; i += stripeWidth * 2) {
        ctx.fillStyle = i % (stripeWidth * 4) === 0 ? color1 : color2;
        ctx.fillRect(i, 0, stripeWidth, size);
      }
      break;
    }

    case 'checkerboard': {
      const checkSize = size / 8;
      for (let x = 0; x < size; x += checkSize) {
        for (let y = 0; y < size; y += checkSize) {
          ctx.fillStyle =
            (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0
              ? color1
              : color2;
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
      break;
    }

    case 'grid': {
      ctx.fillStyle = color2;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = color1;
      ctx.lineWidth = 2;
      const gridSize = size / 8;
      for (let i = 0; i <= size; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Create a water normal map
 */
export function createWaterNormalMap(size: number = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Generate wave-like normals
      const nx = Math.sin(x * 0.05 + y * 0.03) * 0.5 + 0.5;
      const ny = Math.cos(y * 0.05 + x * 0.03) * 0.5 + 0.5;
      const nz = 1.0;

      imageData.data[i] = nx * 255;
      imageData.data[i + 1] = ny * 255;
      imageData.data[i + 2] = nz * 255;
      imageData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Apply environment map to material
 */
export function applyEnvironmentMap(
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  envMapIntensity: number = 1
): void {
  const pmremGenerator = new THREE.PMREMGenerator(new THREE.WebGLRenderer());
  const cubeRenderTarget = pmremGenerator.fromScene(new THREE.Scene());

  material.envMap = cubeRenderTarget.texture;
  material.envMapIntensity = envMapIntensity;
  material.needsUpdate = true;
}

/**
 * Create emissive material
 */
export function createEmissiveMaterial(
  color: string | number,
  emissiveIntensity: number = 1,
  roughness: number = 0.5,
  metalness: number = 0
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    roughness,
    metalness,
  });
}

/**
 * Create holographic material
 */
export function createHolographicMaterial(
  baseColor: string = '#00ffff',
  opacity: number = 0.5
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(baseColor) },
      opacity: { value: opacity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float opacity;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
        float scanline = sin(vPosition.y * 10.0 + time * 2.0) * 0.1 + 0.9;
        
        vec3 finalColor = color * (fresnel + 0.3) * scanline;
        float finalOpacity = opacity * (fresnel * 0.5 + 0.5);
        
        gl_FragColor = vec4(finalColor, finalOpacity);
      }
    `,
  });
}

/**
 * Clone material with modifications
 */
export function cloneMaterial<T extends THREE.Material>(
  material: T,
  modifications: Partial<T> = {}
): T {
  const cloned = material.clone() as T;
  Object.assign(cloned, modifications);
  return cloned;
}

/**
 * Create glowing edge material
 */
export function createGlowMaterial(
  color: string = '#00ffff',
  intensity: number = 2
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
    },
    vertexShader: `
      varying vec3 vNormal;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float intensity;
      
      varying vec3 vNormal;
      
      void main() {
        float glow = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
        gl_FragColor = vec4(color * intensity, glow);
      }
    `,
  });
}
