/**
 * Physics and Simulation Helpers
 * Utilities for physics calculations and simulations
 */

import * as THREE from 'three';

/**
 * Apply gravity to velocity
 */
export function applyGravity(
  velocity: THREE.Vector3,
  gravity: number = 9.8,
  deltaTime: number
): THREE.Vector3 {
  return velocity.clone().add(new THREE.Vector3(0, -gravity * deltaTime, 0));
}

/**
 * Apply friction/damping
 */
export function applyDamping(
  velocity: THREE.Vector3,
  damping: number = 0.95
): THREE.Vector3 {
  return velocity.clone().multiplyScalar(damping);
}

/**
 * Calculate trajectory for projectile motion
 */
export function calculateTrajectory(
  startPos: THREE.Vector3,
  velocity: THREE.Vector3,
  gravity: number = 9.8,
  steps: number = 20
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const dt = 0.1;

  let pos = startPos.clone();
  let vel = velocity.clone();

  for (let i = 0; i < steps; i++) {
    points.push(pos.clone());
    vel = applyGravity(vel, gravity, dt);
    pos.add(vel.clone().multiplyScalar(dt));
  }

  return points;
}

/**
 * Simple spring physics
 */
export class Spring {
  private position: number;
  private velocity: number;
  private target: number;

  constructor(
    initialPosition: number = 0,
    private stiffness: number = 0.1,
    private damping: number = 0.8
  ) {
    this.position = initialPosition;
    this.velocity = 0;
    this.target = initialPosition;
  }

  setTarget(target: number): void {
    this.target = target;
  }

  update(deltaTime: number = 1): number {
    const force = (this.target - this.position) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.position += this.velocity * deltaTime;
    return this.position;
  }

  getPosition(): number {
    return this.position;
  }

  getVelocity(): number {
    return this.velocity;
  }
}

/**
 * Vector spring for 3D positions
 */
export class VectorSpring {
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private target: THREE.Vector3;

  constructor(
    initialPosition: THREE.Vector3 = new THREE.Vector3(),
    private stiffness: number = 0.1,
    private damping: number = 0.8
  ) {
    this.position = initialPosition.clone();
    this.velocity = new THREE.Vector3();
    this.target = initialPosition.clone();
  }

  setTarget(target: THREE.Vector3): void {
    this.target.copy(target);
  }

  update(deltaTime: number = 1): THREE.Vector3 {
    const force = this.target
      .clone()
      .sub(this.position)
      .multiplyScalar(this.stiffness);
    this.velocity.add(force);
    this.velocity.multiplyScalar(this.damping);
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    return this.position.clone();
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
}

/**
 * Calculate bounce velocity
 */
export function calculateBounce(
  velocity: THREE.Vector3,
  normal: THREE.Vector3,
  restitution: number = 0.8
): THREE.Vector3 {
  const dot = velocity.dot(normal);
  return velocity
    .clone()
    .sub(normal.clone().multiplyScalar(2 * dot * restitution));
}

/**
 * Apply force to rigidbody simulation
 */
export interface RigidBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  forces: THREE.Vector3[];
}

export function updateRigidBody(body: RigidBody, deltaTime: number): void {
  // Sum all forces
  const totalForce = body.forces.reduce(
    (sum, force) => sum.add(force),
    new THREE.Vector3()
  );

  // F = ma => a = F/m
  const acceleration = totalForce.divideScalar(body.mass);

  // Update velocity
  body.velocity.add(acceleration.multiplyScalar(deltaTime));

  // Update position
  body.position.add(body.velocity.clone().multiplyScalar(deltaTime));

  // Clear forces for next frame
  body.forces.length = 0;
}

/**
 * Verlet integration for stable physics
 */
export class VerletParticle {
  public position: THREE.Vector3;
  private previousPosition: THREE.Vector3;

  constructor(position: THREE.Vector3 = new THREE.Vector3()) {
    this.position = position.clone();
    this.previousPosition = position.clone();
  }

  update(
    deltaTime: number,
    acceleration: THREE.Vector3 = new THREE.Vector3()
  ): void {
    const velocity = this.position.clone().sub(this.previousPosition);
    this.previousPosition.copy(this.position);

    this.position
      .add(velocity)
      .add(acceleration.multiplyScalar(deltaTime * deltaTime));
  }

  setPosition(position: THREE.Vector3): void {
    this.previousPosition.copy(this.position);
    this.position.copy(position);
  }
}

/**
 * Calculate orbit position
 */
export function calculateOrbitPosition(
  center: THREE.Vector3,
  radius: number,
  angle: number,
  height: number = 0
): THREE.Vector3 {
  return new THREE.Vector3(
    center.x + Math.cos(angle) * radius,
    center.y + height,
    center.z + Math.sin(angle) * radius
  );
}

/**
 * Calculate centripetal force
 */
export function calculateCentripetalForce(
  mass: number,
  velocity: number,
  radius: number
): number {
  return (mass * velocity * velocity) / radius;
}

/**
 * Simple pendulum simulation
 */
export class Pendulum {
  private angle: number;
  private angularVelocity: number;

  constructor(
    private length: number,
    private gravity: number = 9.8,
    initialAngle: number = Math.PI / 4
  ) {
    this.angle = initialAngle;
    this.angularVelocity = 0;
  }

  update(deltaTime: number): void {
    const angularAcceleration =
      -(this.gravity / this.length) * Math.sin(this.angle);
    this.angularVelocity += angularAcceleration * deltaTime;
    this.angularVelocity *= 0.999; // Damping
    this.angle += this.angularVelocity * deltaTime;
  }

  getPosition(pivot: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
      pivot.x + Math.sin(this.angle) * this.length,
      pivot.y - Math.cos(this.angle) * this.length,
      pivot.z
    );
  }

  getAngle(): number {
    return this.angle;
  }
}

/**
 * Calculate drag force
 */
export function calculateDrag(
  velocity: THREE.Vector3,
  dragCoefficient: number = 0.1,
  area: number = 1
): THREE.Vector3 {
  const speed = velocity.length();
  const dragMagnitude = dragCoefficient * area * speed * speed;
  return velocity.clone().normalize().multiplyScalar(-dragMagnitude);
}

/**
 * Wind force simulation
 */
export function calculateWindForce(
  position: THREE.Vector3,
  time: number,
  strength: number = 1
): THREE.Vector3 {
  const noiseX = Math.sin(position.x * 0.1 + time * 0.5) * Math.cos(time * 0.3);
  const noiseY = Math.cos(position.y * 0.1 + time * 0.4) * Math.sin(time * 0.2);
  const noiseZ =
    Math.sin(position.z * 0.1 + time * 0.6) * Math.cos(time * 0.25);

  return new THREE.Vector3(noiseX, noiseY, noiseZ).multiplyScalar(strength);
}
