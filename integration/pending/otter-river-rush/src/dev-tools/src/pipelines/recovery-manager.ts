/**
 * Recovery Manager - Handles task recovery and matching logic
 * Prevents wasting API credits by finding existing Meshy tasks
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { MeshyAPI } from '../meshy/index.js';
import type { MeshyTask } from '../meshy/text_to_3d.js';

/** Represents an unmatched task from Meshy that doesn't correspond to any expected model */
interface AlienTask {
  id: string;
  status: MeshyTask['status'];
  progress?: number;
  prompt?: string;
  glbFilename?: string;
}

/** Represents a duplicate task that should be cleaned up */
interface DuplicateTask {
  id: string;
  outputPath: string;
  prompt?: string;
}

/** Extended Meshy task with prompt information for matching */
interface MeshyTaskWithPrompt extends MeshyTask {
  prompt?: string;
}

export interface CompletionStatus {
  completed: Set<string>; // Output paths that are complete
  inProgress: Map<string, string>; // Output path -> task ID
  alien: AlienTask[]; // Tasks in Meshy not from current manifests
}

export class RecoveryManager {
  private meshyApi: MeshyAPI;

  constructor(meshyApi: MeshyAPI) {
    this.meshyApi = meshyApi;
  }

  /**
   * Auto-recovery: Sync with Meshy API to determine completion status
   * Downloads existing tasks instead of regenerating!
   */
  async autoRecover(expectedModels: string[]): Promise<CompletionStatus> {
    const status: CompletionStatus = {
      completed: new Set(),
      inProgress: new Map(),
      alien: [],
    };

    try {
      // Fetch recent tasks from Meshy
      const allTasks = await this.meshyApi.getRecentTasks(
        expectedModels.length
      );

      if (!allTasks || allTasks.length === 0) {
        return status;
      }

      // Track stats
      let _downloaded = 0;
      let _matched = 0;
      let _inProgress = 0;
      let _duplicates = 0;
      const unmatchedTasks: AlienTask[] = [];
      const duplicateTasks: DuplicateTask[] = [];
      const processedOutputs = new Set<string>();

      // Sort tasks by created_at (oldest first)
      const sortedTasks = [...allTasks].sort((a, b) => {
        const timeA =
          typeof a.created_at === 'number'
            ? a.created_at
            : a.created_at
              ? new Date(a.created_at).getTime()
              : 0;
        const timeB =
          typeof b.created_at === 'number'
            ? b.created_at
            : b.created_at
              ? new Date(b.created_at).getTime()
              : 0;
        return timeA - timeB;
      });

      // Process each Meshy task
      for (const task of sortedTasks) {
        if (!task.model_urls?.glb) {
          continue;
        }

        // Try to match task to expected model
        const matchedModel = this.matchTaskToModel(task, expectedModels);

        if (!matchedModel) {
          unmatchedTasks.push({
            id: task.id,
            status: task.status,
            progress: task.progress,
            prompt: task.prompt,
            glbFilename: MeshyAPI.extractFilenameFromGLBURL(
              task.model_urls.glb
            ),
          });
          continue;
        }

        // Check for duplicates
        if (processedOutputs.has(matchedModel)) {
          _duplicates++;
          if (task.status === 'SUCCEEDED') {
            duplicateTasks.push({
              id: task.id,
              outputPath: matchedModel,
              prompt: task.prompt,
            });
          }
          continue;
        }

        _matched++;
        processedOutputs.add(matchedModel);

        // Handle based on status
        switch (task.status) {
          case 'SUCCEEDED':
            status.completed.add(matchedModel);
            break;

          case 'IN_PROGRESS':
          case 'PENDING':
            _inProgress++;
            status.inProgress.set(matchedModel, task.id);
            break;

          case 'FAILED':
          case 'EXPIRED':
            break;
        }
      }

      // Mark unmatched tasks as alien
      for (const task of unmatchedTasks) {
        status.alien.push(task);
      }

      // Clean up duplicates
      if (duplicateTasks.length > 0 && duplicateTasks.length < 20) {
        await this.cleanupDuplicates(duplicateTasks);
      }
    } catch {
      // Ignore recovery errors - just return current status
    }

    return status;
  }

  /**
   * Match Meshy task to expected model by prompt similarity
   */
  private matchTaskToModel(
    task: MeshyTaskWithPrompt,
    expectedModels: string[]
  ): string | null {
    const taskPrompt = (task.prompt || '').toLowerCase();

    for (const model of expectedModels) {
      const modelName = model.toLowerCase();

      // Match otter
      if (taskPrompt.includes('otter') && modelName.includes('otter')) {
        return model;
      }

      // Match rock
      if (taskPrompt.includes('rock') && modelName.includes('rock')) {
        if (taskPrompt.includes('moss') && modelName.includes('mossy'))
          return model;
        if (taskPrompt.includes('crack') && modelName.includes('crack'))
          return model;
        if (taskPrompt.includes('crystal') && modelName.includes('crystal'))
          return model;
        if (
          !taskPrompt.includes('moss') &&
          !taskPrompt.includes('crack') &&
          !taskPrompt.includes('crystal') &&
          modelName === 'rock-river.glb'
        ) {
          return model;
        }
      }

      // Match coin
      if (taskPrompt.includes('coin') && modelName.includes('coin')) {
        return model;
      }

      // Match gems
      if (taskPrompt.includes('gem') || taskPrompt.includes('gemstone')) {
        if (taskPrompt.includes('blue') && modelName.includes('blue'))
          return model;
        if (
          (taskPrompt.includes('red') || taskPrompt.includes('ruby')) &&
          modelName.includes('red')
        )
          return model;
      }
    }

    return null;
  }

  /**
   * Clean up duplicate tasks
   */
  private async cleanupDuplicates(
    duplicateTasks: DuplicateTask[]
  ): Promise<void> {
    let _cleanedCount = 0;

    for (const dup of duplicateTasks) {
      try {
        await this.meshyApi.deleteTask(dup.id);
        _cleanedCount++;
      } catch (_error) {
        // Ignore cleanup errors
      }
    }
  }
}
