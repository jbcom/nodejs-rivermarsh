/**
 * Haptic Feedback Utility
 * Provides a unified interface for vibration feedback across web and mobile.
 */

export const HAPTIC_PATTERNS = {
    jump: 10,
    dodge: [5, 20, 5] as number[],
    collect: 15,
    hit: [50, 50, 50] as number[],
    damage: [100, 50, 100] as number[],
    gameOver: [100, 100, 200] as number[],
    success: 20,
    button: 5,
};

/**
 * Trigger haptic feedback
 * @param pattern Number or array of numbers representing vibration pattern in ms
 * @param enabled Whether haptics are enabled in settings
 */
export function hapticFeedback(pattern: number | number[], enabled = true) {
    if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Silently fail if vibrate is blocked or unsupported
        }
    }
}
