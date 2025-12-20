# Meshy API Alignment Review

**Date:** 2025-10-27
**Status:** 🔴 NEEDS FIXES

## API Documentation Review

### 1. Auto-Rigging API ✅ MOSTLY ALIGNED

**Endpoint:** `POST /openapi/v1/rigging`

**Parameters:**
- `input_task_id` OR `model_url` (not both!)
- `height_meters` (optional, default 1.7)

**Returns Automatically:**
```json
{
  "result": {
    "rigged_character_glb_url": "...",
    "rigged_character_fbx_url": "...",
    "basic_animations": {
      "walking_glb_url": "...",
      "walking_fbx_url": "...",
      "walking_armature_glb_url": "...",
      "running_glb_url": "...",
      "running_fbx_url": "...",
      "running_armature_glb_url": "..."
    }
  }
}
```

**Our Implementation:** ✅ Correct
- Using `/openapi/v1/rigging`
- Passing `input_task_id`
- Getting basic animations automatically

### 2. Animation Library API ❌ NOT USING

**Endpoint:** `POST /openapi/v1/animations`

**Purpose:** Apply 600+ specific animations to rigged characters

**Parameters:**
- `rig_task_id` (required) - ID from rigging task
- `action_id` (required) - Animation ID (0-600+)
- `post_process` (optional) - FPS conversion, format conversion

**Available Animations:**
- ID 0: Idle
- ID 1: Walking_Woman
- ID 8: Dead  
- ID 13: Jump_Run
- ID 14-16: Various runs
- ID 86: Basic_Jump
- ID 178-180: Hit reactions
- ID 181-190: Death animations
- ID 284: Collect_Object ⭐ Perfect for picking up coins!
- ID 466: Regular_Jump
- And 500+ more!

**Our Status:** ❌ NOT IMPLEMENTED
- We only get basic walk/run from rigging
- Not using custom animations at all
- Missing jump, collect, hit, death animations!

### 3. Retexture API ❌ WRONG PARAMETERS

**Endpoint:** `POST /openapi/v1/retexture` (v1, not v2!)

**Parameters:**
- `input_task_id` OR `model_url` (required)
- `text_style_prompt` OR `image_style_url` (required) ⚠️ NOT `prompt`!
- `ai_model` (optional, default meshy-5)
- `enable_original_uv` (optional, default true)
- `enable_pbr` (optional, default false)

**Our Issues:**
1. ❌ Using `/openapi/v2/image-to-3d` - WRONG ENDPOINT!
2. ❌ Using `prompt` parameter - Should be `text_style_prompt`!
3. ❌ Using `art_style` - Not a valid parameter!
4. ❌ Using `resolution` - Not a valid parameter!

**Correct Usage:**
```typescript
{
  input_task_id: "refined_task_id",  // from text-to-3d refine
  text_style_prompt: "green moss covering, wet appearance",
  enable_pbr: true,
  enable_original_uv: true
}
```

## Required Fixes

### Fix 1: Update retexture.ts

**Current (WRONG):**
```typescript
const data = await makeRequestWithRetry(`${this.baseUrl}/image-to-3d`, {
  body: JSON.stringify({
    prompt: params.prompt,  // WRONG
    art_style: params.art_style,  // WRONG
    resolution: params.resolution,  // WRONG
  })
});
```

**Should Be:**
```typescript
const data = await makeRequestWithRetry(`${this.baseUrl}/retexture`, {
  body: JSON.stringify({
    input_task_id: params.input_task_id,
    text_style_prompt: params.text_style_prompt,
    enable_pbr: params.enable_pbr,
    enable_original_uv: params.enable_original_uv
  })
});
```

### Fix 2: Add Animation API Support

Create new `animations.ts` module:

```typescript
/**
 * Meshy Animation API
 * Apply 600+ animations to rigged characters
 */

export interface AnimationTaskParams {
  rig_task_id: string;  // From rigging task
  action_id: number;    // 0-600+ from animation library
  post_process?: {
    operation_type: 'change_fps' | 'fbx2usdz' | 'extract_armature';
    fps?: 24 | 25 | 30 | 60;
  };
}

export interface AnimationTask {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  result?: {
    animation_glb_url: string;
    animation_fbx_url: string;
    processed_usdz_url?: string;
  };
}

export class AnimationsAPI extends MeshyBaseClient {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.meshy.ai/openapi/v1');
  }
  
  async createAnimationTask(params: AnimationTaskParams): Promise<AnimationTask> {
    return this.request('/animations', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  async getAnimationTask(taskId: string): Promise<AnimationTask> {
    return this.request(`/animations/${taskId}`);
  }
  
  async pollAnimationTask(taskId: string): Promise<AnimationTask> {
    // Similar polling logic
  }
}
```

### Fix 3: Update Model Specifications

Add specific animation IDs for otter:

```typescript
const OTTER_ANIMATIONS = {
  idle: 0,           // Idle
  walk: 30,          // Casual_Walk
  run: 14,           // Run_02
  jump: 466,         // Regular_Jump
  collect: 284,      // Collect_Object ⭐
  hit: 178,          // Hit_Reaction
  death: 8,          // Dead
  happy: 44,         // Happy_jump_f (celebration)
  dodge_left: 158,   // Roll_Dodge
  dodge_right: 159,  // Roll_Dodge_1
};
```

## Implementation Priority

### High Priority (Critical)
1. ✅ Fix retexture.ts endpoint and parameters
2. ✅ Add animations.ts module
3. ✅ Update generator to use animation library

### Medium Priority (Important)
4. Test retexturing with correct API
5. Generate otter with multiple animations
6. Download all animation variants

### Low Priority (Nice to Have)
7. Add animation library constants
8. Support FPS conversion
9. Support USDZ export

## Cost Implications

**Current Plan:**
- Rigging: ~$0.50 (includes basic walk/run)
- Each extra animation: ~$0.30

**Otter Animations:**
- Base rigging: $0.50 (walk + run included)
- Jump: $0.30
- Collect: $0.30
- Hit: $0.30
- Death: $0.30
- **Total: ~$2.00** for complete otter

**Worth It?** YES! 
- Professional animations
- Game-ready quality
- No manual animation work

## Next Steps

1. Fix retexture.ts
2. Add animations.ts
3. Update generator with animation IDs
4. Test generation
5. Verify all animations work
