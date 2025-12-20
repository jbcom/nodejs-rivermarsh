export interface SaveData {
  highScore: number;
  totalGamesPlayed: number;
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

const STORAGE_KEY = 'otter-river-rush-save';

export class StorageManager {
  /**
   * Deep merge utility to recursively merge nested objects
   * Implements ARCHITECTURE.md specification (lines 1093-1119)
   */
  private static deepMerge(
    target: SaveData,
    source: Partial<SaveData>
  ): SaveData {
    const result = { ...target } as SaveData;

    for (const key in source) {
      if (Object.hasOwn(source, key)) {
        const sourceValue = source[key as keyof SaveData];
        const targetValue = result[key as keyof SaveData];

        // If both values are plain objects, merge recursively
        if (
          sourceValue !== null &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue !== null &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          // Merge nested objects
          (result as unknown as Record<string, unknown>)[key] = {
            ...(targetValue as Record<string, unknown>),
            ...(sourceValue as Record<string, unknown>),
          };
        } else if (sourceValue !== undefined) {
          // Otherwise, overwrite with source value
          (result as unknown as Record<string, unknown>)[key] = sourceValue;
        }
      }
    }

    return result;
  }

  /**
   * Save data with deep merge support
   * Partial updates preserve existing data
   */
  static save(data: Partial<SaveData>): void {
    try {
      const existing = this.load() || this.getDefaultData();
      const merged = this.deepMerge(existing, data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  static load(): SaveData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  }

  static getDefaultData(): SaveData {
    return {
      highScore: 0,
      totalGamesPlayed: 0,
      achievements: [],
      settings: {
        soundEnabled: true,
        musicEnabled: true,
      },
    };
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
