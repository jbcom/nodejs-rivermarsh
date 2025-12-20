/**
 * Water Component - Using @jbcom/strata
 *
 * Replaces custom shader implementation with Strata's AdvancedWater
 * which provides caustics, foam, and depth-based coloring.
 */

import { AdvancedWater } from '@jbcom/strata'

interface WaterProps {
    position?: [number, number, number];
    size?: number;
}

export function Water({ position = [0, -0.2, 0], size = 100 }: WaterProps) {
    return (
        <group position={position}>
            <AdvancedWater
                size={size}
                waterColor="#006994"
                deepWaterColor="#003366"
                foamColor="#ffffff"
                causticIntensity={0.4}
            />
        </group>
    );
}
