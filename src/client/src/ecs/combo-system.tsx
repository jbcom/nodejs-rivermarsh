import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export function ComboSystem() {
  const comboTimerRef = useRef<number>(0);
  const COMBO_TIMEOUT = 2000; // 2 seconds

  useFrame((_, dt) => {
    const { status, combo, resetCombo } = useGameStore.getState();
    if (status !== 'playing') return;

    if (combo > 0) {
      comboTimerRef.current -= dt * 1000;

      if (comboTimerRef.current <= 0) {
        resetCombo();
      }
    }
  });

  // Reset timer when combo increases
  useEffect(() => {
    let prevCombo = useGameStore.getState().combo;

    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.combo > prevCombo) {
        comboTimerRef.current = COMBO_TIMEOUT;
      }
      prevCombo = state.combo;
    });

    return unsubscribe;
  }, []);

  return null;
}
