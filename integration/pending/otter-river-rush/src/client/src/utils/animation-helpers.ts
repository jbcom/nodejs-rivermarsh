import type { With } from 'miniplex';
import type { Entity } from '../ecs/world';

export type AnimationName =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'collect'
  | 'hit'
  | 'death'
  | 'victory'
  | 'happy'
  | 'dodgeLeft'
  | 'dodgeRight';

export function setAnimation(
  entity: With<Entity, 'animation'>,
  animationName: AnimationName,
  duration?: number
) {
  if (!entity.animation.urls[animationName]) {
    console.warn(`Animation ${animationName} not found for entity`);
    return;
  }

  entity.animation.current = animationName;

  if (duration) {
    setTimeout(() => {
      // Return to idle or walk based on game state
      if (entity.animation) {
        entity.animation.current = 'walk';
      }
    }, duration);
  }
}

export function playOneShotAnimation(
  entity: With<Entity, 'animation'>,
  animationName: AnimationName,
  duration: number,
  returnTo: AnimationName = 'walk'
) {
  setAnimation(entity, animationName);

  setTimeout(() => {
    if (entity.animation) {
      entity.animation.current = returnTo;
    }
  }, duration);
}

export function hasAnimation(
  entity: With<Entity, 'animation'>,
  animationName: string
): boolean {
  return !!entity.animation.urls[animationName];
}

export function getAnimationURL(
  entity: With<Entity, 'animation'>,
  animationName: string
): string | undefined {
  return entity.animation.urls[animationName];
}

export function queueAnimations(
  entity: With<Entity, 'animation'>,
  animations: Array<{ name: AnimationName; duration: number }>
) {
  let currentDelay = 0;

  for (const anim of animations) {
    setTimeout(() => {
      if (entity.animation) {
        entity.animation.current = anim.name;
      }
    }, currentDelay);

    currentDelay += anim.duration;
  }

  // Return to walk after all animations
  setTimeout(() => {
    if (entity.animation) {
      entity.animation.current = 'walk';
    }
  }, currentDelay);
}

export function randomAnimation(
  entity: With<Entity, 'animation'>,
  animations: AnimationName[]
): void {
  const randomIndex = Math.floor(Math.random() * animations.length);
  setAnimation(entity, animations[randomIndex]);
}

export function crossfadeAnimation(
  entity: With<Entity, 'animation'>,
  toAnimation: AnimationName,
  fadeDuration: number = 300
) {
  // Simplified crossfade - just set animation
  // In a real implementation, would blend animations
  setTimeout(() => {
    setAnimation(entity, toAnimation);
  }, fadeDuration / 2);
}

export interface AnimationState {
  current: string;
  previous: string | null;
  transitionProgress: number;
  looping: boolean;
}

export function createAnimationState(initial: string = 'idle'): AnimationState {
  return {
    current: initial,
    previous: null,
    transitionProgress: 1,
    looping: true,
  };
}

export function updateAnimationState(
  state: AnimationState,
  newAnimation: string,
  transitionTime: number = 300
): void {
  if (state.current !== newAnimation) {
    state.previous = state.current;
    state.current = newAnimation;
    state.transitionProgress = 0;

    // Animate transition
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      state.transitionProgress = Math.min(elapsed / transitionTime, 1);

      if (state.transitionProgress >= 1) {
        clearInterval(interval);
        state.previous = null;
      }
    }, 16);
  }
}
