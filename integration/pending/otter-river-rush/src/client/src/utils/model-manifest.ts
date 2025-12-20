import { getAssetPath } from './assets';

type ModelsManifest = {
  models: Record<string, string>;
  categories?: Record<string, string[]>;
};

let manifestCache: ModelsManifest | null = null;

export async function loadModelsManifest(): Promise<ModelsManifest> {
  if (manifestCache) return manifestCache;
  try {
    const url = getAssetPath('models/models-manifest.json');
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
    const data = (await res.json()) as ModelsManifest;
    manifestCache = data;
    return data;
  } catch {
    // Fallback empty manifest; callers should handle defaults
    manifestCache = { models: {}, categories: {} };
    return manifestCache;
  }
}

export function getModelVariantsSync(
  category: 'rock' | 'coin' | 'gem'
): string[] {
  if (!manifestCache) return [];
  const list = manifestCache.categories?.[category];
  if (Array.isArray(list) && list.length > 0) return list;
  return [];
}

export function pickRandom<T>(arr: T[], fallback?: T): T | undefined {
  if (!arr || arr.length === 0) return fallback;
  return arr[Math.floor(Math.random() * arr.length)];
}
