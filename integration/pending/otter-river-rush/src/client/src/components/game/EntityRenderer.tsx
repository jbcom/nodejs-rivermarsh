/**
 * Entity Renderer - Renders all game entities using Miniplex ECS
 * Automatically loads and displays 3D models for each entity
 */

import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { ECS, queries } from '../../ecs/world';

/**
 * Model component - Loads and renders a GLB model
 */
function Model({
  url,
  scale = 1,
}: {
  url: string;
  scale?: number;
}): React.JSX.Element {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone()} scale={scale} />
    </group>
  );
}

/**
 * Animated Model - Loads GLB with animations
 */
function AnimatedModel({
  baseUrl,
  animationUrl,
  scale = 1,
}: {
  baseUrl: string;
  animationUrl?: string;
  scale?: number;
}): React.JSX.Element {
  const groupRef = useRef<Group>(null);
  const base = useGLTF(baseUrl);
  const anim = animationUrl ? useGLTF(animationUrl) : null;

  // Use animation GLB's clips if available; fall back to none
  const clips = useMemo(
    () => (anim?.animations ? anim.animations : []),
    [anim]
  );
  const { actions } = useAnimations(clips, groupRef);

  useEffect(() => {
    // Stop all current actions
    Object.values(actions).forEach((a) => a?.stop());
    // Play the first clip if available
    const first = Object.keys(actions)[0];
    if (first) {
      actions[first]?.reset().fadeIn(0.15).play();
    }
    return () => {
      Object.values(actions).forEach((a) => a?.fadeOut(0.1));
    };
  }, [actions, animationUrl]);

  const displayObject = useMemo(
    () => (anim?.scene ?? base.scene).clone(),
    [anim, base]
  );
  return (
    <group ref={groupRef}>
      <primitive object={displayObject} scale={scale} />
    </group>
  );
}

/**
 * Render the player (otter) with current animation
 */
export function PlayerRenderer(): React.JSX.Element | null {
  return (
    <ECS.Entities in={queries.player}>
      {(entity) => (
        <ECS.Entity entity={entity}>
          <ECS.Component name="three">
            <group
              position={[
                entity.position.x,
                entity.position.y,
                entity.position.z,
              ]}
            >
              {entity.animation &&
              entity.animation.urls[entity.animation.current] ? (
                <AnimatedModel
                  baseUrl={entity.model!.url}
                  animationUrl={entity.animation.urls[entity.animation.current]}
                  scale={entity.model!.scale}
                />
              ) : (
                <Model url={entity.model!.url} scale={entity.model!.scale} />
              )}
            </group>
          </ECS.Component>
        </ECS.Entity>
      )}
    </ECS.Entities>
  );
}

/**
 * Render all obstacles with variant support
 */
export function ObstaclesRenderer(): React.JSX.Element | null {
  return (
    <ECS.Entities in={queries.obstacles}>
      {(entity) => (
        <ECS.Entity entity={entity}>
          <ECS.Component name="three">
            <group
              position={[
                entity.position.x,
                entity.position.y,
                entity.position.z,
              ]}
            >
              <Model url={entity.model!.url} scale={entity.model!.scale} />
            </group>
          </ECS.Component>
        </ECS.Entity>
      )}
    </ECS.Entities>
  );
}

/**
 * Render all collectibles
 */
export function CollectiblesRenderer(): React.JSX.Element | null {
  return (
    <ECS.Entities in={queries.collectibles}>
      {(entity) => (
        <ECS.Entity entity={entity}>
          <ECS.Component name="three">
            <group
              position={[
                entity.position.x,
                entity.position.y,
                entity.position.z,
              ]}
              rotation={[0, Date.now() * 0.001, 0]} // Spinning collectibles
            >
              <Model url={entity.model!.url} scale={entity.model!.scale} />
            </group>
          </ECS.Component>
        </ECS.Entity>
      )}
    </ECS.Entities>
  );
}

/**
 * Render particles
 */
export function ParticlesRenderer(): React.JSX.Element | null {
  return (
    <ECS.Entities in={queries.particles}>
      {(entity) => (
        <mesh
          position={[entity.position.x, entity.position.y, entity.position.z]}
        >
          <sphereGeometry args={[entity.particle!.size * 0.01, 8, 8]} />
          <meshBasicMaterial color={entity.particle!.color} />
        </mesh>
      )}
    </ECS.Entities>
  );
}

/**
 * Master Entity Renderer - Renders all entities
 */
export function EntityRenderer(): React.JSX.Element {
  return (
    <>
      <PlayerRenderer />
      <ObstaclesRenderer />
      <CollectiblesRenderer />
      <ParticlesRenderer />
    </>
  );
}

// Preload all models using proper base URL paths
import { ASSET_URLS } from '../../config/game-constants';

useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_IDLE);
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_WALK);
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_RUN);
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_JUMP);
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_COLLECT);
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_HIT);
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_DEATH);
useGLTF.preload(ASSET_URLS.MODELS.ROCK_RIVER);
useGLTF.preload(ASSET_URLS.MODELS.ROCK_MOSSY);
useGLTF.preload(ASSET_URLS.MODELS.ROCK_CRACKED);
useGLTF.preload(ASSET_URLS.MODELS.ROCK_CRYSTAL);
useGLTF.preload(ASSET_URLS.MODELS.COIN);
useGLTF.preload(ASSET_URLS.MODELS.GEM_RED);
