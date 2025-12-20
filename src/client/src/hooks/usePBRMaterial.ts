/**
 * PBR Material Hook
 * Based on ser-plonk's materials.ts
 * Loads and configures PBR textures from AmbientCG
 */

import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export interface PBRMaterialConfig {
  color: string;
  normal?: string;
  roughness?: string;
  ao?: string;
  metallic?: string;
  displacement?: string;
  repeat?: [number, number];
  normalScale?: number;
}

/**
 * React hook for PBR materials using @react-three/drei
 * Automatically handles texture loading, caching, and configuration
 */
export function usePBRMaterial(
  config: PBRMaterialConfig
): THREE.MeshStandardMaterial {
  const textureUrls = useMemo(() => {
    const urls: string[] = [];
    if (config.color) urls.push(config.color);
    if (config.normal) urls.push(config.normal);
    if (config.roughness) urls.push(config.roughness);
    if (config.ao) urls.push(config.ao);
    if (config.metallic) urls.push(config.metallic);
    if (config.displacement) urls.push(config.displacement);
    return urls;
  }, [
    config.color,
    config.normal,
    config.roughness,
    config.ao,
    config.metallic,
    config.displacement,
  ]);

  const textures = useTexture(textureUrls);

  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial();
    const repeat = config.repeat || [1, 1];
    let textureIndex = 0;

    // Configure base color texture (sRGB)
    if (config.color && textures[textureIndex]) {
      const tex = Array.isArray(textures) ? textures[textureIndex++] : textures;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      material.map = tex;
    }

    // Configure normal map (linear)
    if (config.normal && textures[textureIndex]) {
      const tex = Array.isArray(textures) ? textures[textureIndex++] : textures;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.NoColorSpace;
      material.normalMap = tex;
      material.normalScale = new THREE.Vector2(
        config.normalScale || 1,
        config.normalScale || 1
      );
    }

    // Configure roughness map (linear)
    if (config.roughness && textures[textureIndex]) {
      const tex = Array.isArray(textures) ? textures[textureIndex++] : textures;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.NoColorSpace;
      material.roughnessMap = tex;
    }

    // Configure AO map (linear)
    if (config.ao && textures[textureIndex]) {
      const tex = Array.isArray(textures) ? textures[textureIndex++] : textures;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.NoColorSpace;
      material.aoMap = tex;
      material.aoMapIntensity = 1.0;
    }

    // Configure metallic map (linear)
    if (config.metallic && textures[textureIndex]) {
      const tex = Array.isArray(textures) ? textures[textureIndex++] : textures;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.NoColorSpace;
      material.metalnessMap = tex;
    }

    // Configure displacement map (linear)
    if (config.displacement && textures[textureIndex]) {
      const tex = Array.isArray(textures) ? textures[textureIndex++] : textures;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.NoColorSpace;
      material.displacementMap = tex;
      material.displacementScale = 0.1;
    }

    return material;
  }, [textures, config.repeat, config.normalScale]);
}
