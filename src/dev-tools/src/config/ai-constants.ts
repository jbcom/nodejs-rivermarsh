/**
 * AI Constants - Centralized AI configuration
 *
 * CRITICAL: Use Sonnet 4.5 everywhere for consistency and predictability
 */

import { anthropic } from '@ai-sdk/anthropic';

/**
 * Anthropic Claude Sonnet 4.5
 * Model ID: claude-sonnet-4-20250514
 *
 * USE THIS EVERYWHERE - Do not use 3.5 or other versions
 */
export const CLAUDE_SONNET_4_5 = anthropic('claude-sonnet-4-20250514');

/**
 * Default temperature for deterministic outputs
 */
export const DEFAULT_TEMPERATURE = 0.1;

/**
 * Temperature for creative outputs
 */
export const CREATIVE_TEMPERATURE = 0.7;
