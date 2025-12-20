import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function useAnimationMixer(
  modelUrl: string,
  animationUrls: Record<string, string>,
  currentAnimation: string
) {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<string | null>(null);

  const { scene, animations } = useGLTF(modelUrl);

  // Load animation files
  useEffect(() => {
    if (!scene) return;

    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

    // Create actions from base model animations
    for (const clip of animations) {
      const action = mixer.clipAction(clip);
      actionsRef.current.set(clip.name, action);
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [scene, animations]);

  // Preload additional animation URLs (useGLTF.preload returns void, just triggers cache)
  useEffect(() => {
    for (const url of Object.values(animationUrls)) {
      try {
        useGLTF.preload(url);
      } catch (error) {
        console.warn(`Failed to preload animation from ${url}:`, error);
      }
    }
  }, [animationUrls]);

  // Switch animations
  useEffect(() => {
    if (!mixerRef.current) return;

    const newAction = actionsRef.current.get(currentAnimation);
    const oldAction = currentActionRef.current
      ? actionsRef.current.get(currentActionRef.current)
      : null;

    if (newAction) {
      if (oldAction && oldAction !== newAction) {
        oldAction.fadeOut(0.3);
      }

      newAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play();

      currentActionRef.current = currentAnimation;
    }
  }, [currentAnimation]);

  // Update mixer
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return { mixer: mixerRef.current, actions: actionsRef.current };
}
