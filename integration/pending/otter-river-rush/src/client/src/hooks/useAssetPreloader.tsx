import { useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { ASSET_URLS } from '../config/game-constants';

export function useAssetPreloader() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const models = Object.values(ASSET_URLS.MODELS);
    const animations = Object.values(ASSET_URLS.ANIMATIONS);
    const allAssets = [...models, ...animations];

    let loadedCount = 0;

    const loadAssets = async () => {
      try {
        for (const url of allAssets) {
          await useGLTF.preload(url);
          loadedCount++;
          setProgress((loadedCount / allAssets.length) * 100);
        }
        setLoaded(true);
      } catch (err) {
        setError(err as Error);
        console.error('Asset loading failed:', err);
      }
    };

    loadAssets();
  }, []);

  return { loaded, progress, error };
}

export function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">🦦 Otter River Rush</h1>
        <div className="w-64 h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-blue-300">
          Loading 3D models... {Math.floor(progress)}%
        </p>
      </div>
    </div>
  );
}
