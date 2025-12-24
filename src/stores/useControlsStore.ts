import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ControlsState {
  movement: {
    x: number;
    y: number;
  };
  camera: {
    x: number;
    y: number;
    azimuth: number;
  };
  actions: {
    interact: boolean;
    attack: boolean;
    jump: boolean;
    dash: boolean;
  };
  debugLogging: boolean;
  
  setMovement: (x: number, y: number) => void;
  setCamera: (x: number, y: number) => void;
  setCameraAzimuth: (azimuth: number) => void;
  setAction: (action: 'interact' | 'attack' | 'jump' | 'dash', pressed: boolean) => void;
  resetMovement: () => void;
  resetCamera: () => void;
  toggleDebugLogging: () => void;
}

export const useControlsStore = create<ControlsState>()(
  persist(
    (set, get) => ({
  movement: { x: 0, y: 0 },
  camera: { x: 0, y: 0, azimuth: 0 },
  actions: {
    interact: false,
    attack: false,
    jump: false,
    dash: false,
  },
  debugLogging: false,

  setMovement: (x, y) => {
    const { debugLogging } = get();
    if (debugLogging && (x !== 0 || y !== 0)) {
      console.log(`[Controls] Movement: x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
    }
    set({ movement: { x, y } });
  },

  setCamera: (x, y) => {
    const { debugLogging, camera } = get();
    if (debugLogging && (x !== 0 || y !== 0)) {
      console.log(`[Controls] Camera: x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
    }
    set({ camera: { ...camera, x, y } });
  },

  setCameraAzimuth: (azimuth) => {
    set((state) => ({ camera: { ...state.camera, azimuth } }));
  },

  setAction: (action, pressed) => {
    const { debugLogging } = get();
    if (debugLogging && pressed) {
      console.log(`[Controls] Action: ${action} pressed`);
    }
    set((state) => ({
      actions: {
        ...state.actions,
        [action]: pressed,
      },
    }));
  },

  resetMovement: () => set({ movement: { x: 0, y: 0 } }),
  resetCamera: () => set((state) => ({ camera: { x: 0, y: 0, azimuth: state.camera.azimuth } })),
  toggleDebugLogging: () => set((state) => ({ debugLogging: !state.debugLogging })),
    }),
    {
      name: 'rivermarsh-controls',
      partialize: (state) => ({ debugLogging: state.debugLogging }),
    }
  )
);
