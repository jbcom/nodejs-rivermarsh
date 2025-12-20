/**
 * Meshy API - Modular Architecture
 *
 * Split into focused modules:
 * - text_to_3d: Text-to-3D generation (preview/refine)
 * - rigging: Character rigging and animations
 * - retexture: AI texture generation for variants
 *
 * This enables:
 * - Base tile generation (text_to_3d)
 * - Texture variants (retexture) - cheaper than full regeneration
 * - Character animations (rigging)
 */

import { AnimationsAPI } from './animations.js';
import { RetextureAPI, type RetextureTaskParams } from './retexture.js';
import { RiggingAPI, type RiggingTask } from './rigging.js';
import {
  type MeshyTask,
  type CreateTaskParams as PreviewTaskParams,
  TextTo3DAPI,
} from './text_to_3d.js';

export * from './animations.js';
export * from './retexture.js';
export * from './rigging.js';
export * from './text_to_3d.js';

/** Parameters for refine task */
export interface RefineTaskParams {
  texture_richness?: 'low' | 'medium' | 'high';
}

/**
 * Unified Meshy API with retry logic
 */
export class MeshyAPI {
  public text3d: TextTo3DAPI;
  public rigging: RiggingAPI;
  public retexture: RetextureAPI;
  public animations: AnimationsAPI;

  constructor(apiKey: string) {
    const v2Base = 'https://api.meshy.ai/openapi/v2';
    const _v1Base = 'https://api.meshy.ai/openapi/v1';

    this.text3d = new TextTo3DAPI(apiKey, v2Base);
    this.rigging = new RiggingAPI(apiKey);
    this.retexture = new RetextureAPI(apiKey);
    this.animations = new AnimationsAPI(apiKey);
  }

  /**
   * Shared retry logic for all API calls
   * Handles rate limits, server errors, retries
   */
  async makeRequestWithRetry<T = unknown>(
    url: string,
    options: RequestInit,
    maxRetries = 5
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (response.ok) {
          return response.json() as Promise<T>;
        }

        const errorText = await response.text();
        let errorData: { message?: string } = {};
        try {
          errorData = JSON.parse(errorText) as { message?: string };
        } catch {
          // Not JSON
        }

        switch (response.status) {
          case 400:
            throw new Error(
              `❌ Bad Request (400): ${errorData.message || 'Invalid parameters'}`
            );
          case 401:
            throw new Error(
              `❌ Unauthorized (401): ${errorData.message || 'Invalid API key'}`
            );
          case 402:
            throw new Error(
              `❌ Payment Required (402): ${errorData.message || 'Insufficient funds'}`
            );
          case 403:
            throw new Error(
              `❌ Forbidden (403): ${errorData.message || 'Access forbidden'}`
            );
          case 404:
            throw new Error(
              `❌ Not Found (404): ${errorData.message || 'Resource not found'}`
            );
          case 429: {
            // Rate limit - exponential backoff
            const delayMs = Math.min(1000 * Math.pow(2, attempt), 60000);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          case 500:
          case 502:
          case 503:
          case 504: {
            // Server error - retry with backoff
            const serverDelayMs = Math.min(1000 * Math.pow(2, attempt), 60000);
            await new Promise((resolve) => setTimeout(resolve, serverDelayMs));
            continue;
          }
          default:
            throw new Error(
              `❌ API Error (${response.status}): ${errorData.message || errorText}`
            );
        }
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        const retryDelayMs = Math.min(1000 * Math.pow(2, attempt), 60000);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    throw new Error(`Request failed after ${maxRetries} attempts`);
  }

  /**
   * Create preview task (uses text3d module)
   */
  async createPreviewTask(params: PreviewTaskParams) {
    return this.text3d.createPreviewTask(
      params,
      this.makeRequestWithRetry.bind(this)
    );
  }

  /**
   * Create refine task (uses text3d module)
   */
  async createRefineTask(previewTaskId: string, params?: RefineTaskParams) {
    return this.text3d.createRefineTask(
      previewTaskId,
      this.makeRequestWithRetry.bind(this),
      params
    );
  }

  /**
   * Create rigging task (uses rigging module)
   */
  async createRiggingTask(refineTaskId: string) {
    return this.rigging.createRiggingTask({ input_task_id: refineTaskId });
  }

  /**
   * Create retexture task (uses retexture module)
   * THIS IS KEY FOR TILE VARIANTS
   */
  async createRetextureTask(params: RetextureTaskParams) {
    return this.retexture.createRetextureTask(
      params,
      this.makeRequestWithRetry.bind(this)
    );
  }

  // Delegate other methods to appropriate modules
  async getTask(taskId: string, retryOn404 = true) {
    return this.text3d.getTask(taskId, retryOn404);
  }

  async getRiggingTask(taskId: string) {
    return this.rigging.getRiggingTask(taskId);
  }

  async getRetextureTask(taskId: string) {
    return this.retexture.getRetextureTask(taskId);
  }

  async pollTask(taskId: string, maxRetries?: number, intervalMs?: number) {
    return this.text3d.pollTask(taskId, maxRetries, intervalMs);
  }

  async pollRiggingTask(
    taskId: string,
    maxRetries?: number,
    intervalMs?: number
  ) {
    return this.rigging.pollRiggingTask(taskId, maxRetries, intervalMs);
  }

  async pollRetextureTask(
    taskId: string,
    maxRetries?: number,
    intervalMs?: number
  ) {
    return this.retexture.pollRetextureTask(taskId, maxRetries, intervalMs);
  }

  async listTasks(pageNum?: number, pageSize?: number) {
    return this.text3d.listTasks(pageNum, pageSize);
  }

  async deleteTask(taskId: string) {
    return this.text3d.deleteTask(taskId);
  }

  async deleteRiggingTask(taskId: string) {
    return this.rigging.deleteRiggingTask(taskId);
  }

  async deleteRetextureTask(taskId: string) {
    return this.retexture.deleteRetextureTask(taskId);
  }

  getAnimationUrls(task: RiggingTask) {
    return this.rigging.getAnimationUrls(task);
  }

  getGLBUrl(task: MeshyTask): string | null {
    if (task.model_urls?.glb) return task.model_urls.glb;
    if (task.model_url) return task.model_url;
    return null;
  }

  static extractFilenameFromGLBURL(glbURL: string): string {
    if (!glbURL) return '';
    const parts = glbURL.split('/');
    if (parts.length === 0) return '';
    let filename = parts[parts.length - 1];
    if (filename.endsWith('.glb')) {
      filename = filename.slice(0, -4);
    }
    return filename;
  }

  async getRecentTasks(estimatedJobCount: number = 600): Promise<MeshyTask[]> {
    // Implementation for recovery manager
    const allTasks: MeshyTask[] = [];
    let pageNum = 1;
    const pageSize = 100;
    const tasksNeeded = Math.ceil(estimatedJobCount * 1.2);
    const maxPages = Math.ceil(tasksNeeded / pageSize);

    while (pageNum <= maxPages) {
      try {
        const tasks = await this.listTasks(pageNum, pageSize);
        if (!Array.isArray(tasks) || tasks.length === 0) break;

        allTasks.push(...tasks);

        if (allTasks.length >= tasksNeeded) {
          break;
        }

        if (tasks.length < pageSize) break;

        pageNum++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`   ⚠️  Error on page ${pageNum}: ${errorMessage}`);
        if (allTasks.length > 0) break;
        throw error;
      }
    }
    return allTasks;
  }
}
