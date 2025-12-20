/**
 * AmbientCG Texture Integration
 * Based on ser-plonk's ambientcg.ts system
 * Provides local texture path helpers for PBR materials
 */

/**
 * Get local texture paths for an AmbientCG asset (assuming downloaded to public/textures/)
 */
export function getLocalTexturePaths(
  apiId: string,
  resolution = '1K',
  format = 'jpg'
) {
  const ext = format.toLowerCase();
  const baseUrl = import.meta.env.BASE_URL || '/';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return {
    baseColor: `${prefix}textures/${apiId}/${apiId}_${resolution}_Color.${ext}`,
    normal: `${prefix}textures/${apiId}/${apiId}_${resolution}_NormalGL.${ext}`,
    roughness: `${prefix}textures/${apiId}/${apiId}_${resolution}_Roughness.${ext}`,
    ao: `${prefix}textures/${apiId}/${apiId}_${resolution}_AmbientOcclusion.${ext}`,
    displacement: `${prefix}textures/${apiId}/${apiId}_${resolution}_Displacement.${ext}`,
    metallic: `${prefix}textures/${apiId}/${apiId}_${resolution}_Metalness.${ext}`,
  };
}

/**
 * Common texture presets for quick access
 */
export const AMBIENT_CG_TEXTURES = {
  // River/Water textures
  WATER_RIVER: { id: 'WaterPlain001', tags: ['water', 'river', 'surface'] },
  WATER_RAPIDS: { id: 'Water002', tags: ['water', 'rapids', 'foam'] },

  // Ground textures
  GRASS: { id: 'Grass001', tags: ['grass', 'ground', 'nature'] },
  GRASS_DRY: { id: 'Grass004', tags: ['grass', 'ground', 'dry'] },
  DIRT: { id: 'Ground037', tags: ['dirt', 'ground', 'path'] },
  MUD: { id: 'Ground025', tags: ['mud', 'ground', 'wet'] },
  SAND: { id: 'Ground037', tags: ['sand', 'beach', 'ground'] },

  // Rock textures
  ROCK_MOSSY: { id: 'Rock035', tags: ['rock', 'stone', 'mossy'] },
  ROCK_RIVER: { id: 'Rock022', tags: ['rock', 'river', 'wet'] },
  ROCK_GRANITE: { id: 'Rock024', tags: ['rock', 'granite', 'mountain'] },

  // Nature
  BARK: { id: 'Bark007', tags: ['bark', 'tree', 'nature'] },
  MOSS: { id: 'Moss001', tags: ['moss', 'ground', 'nature'] },
} as const;

/**
 * Get AmbientCG download URL for dev-tools
 */
export function getAmbientCGDownloadURL(
  apiId: string,
  resolution = '1K',
  format = 'JPG'
) {
  const fileName = `${apiId}_${resolution}-${format}.zip`;
  return `https://ambientcg.com/get?file=${encodeURIComponent(fileName)}`;
}
