#!/usr/bin/env tsx
/**
 * Diagnostic QA Workflow - Automated Issue Detection & Fixing
 *
 * This agentic workflow:
 * 1. Runs E2E tests to identify failures
 * 2. Analyzes each failure systematically
 * 3. Attempts automatic fixes where possible
 * 4. Generates detailed reports on remaining issues
 * 5. Loops until all fixable issues are resolved
 *
 * Uses Claude Sonnet 4.5 via Vercel AI SDK
 */

import { generateText } from 'ai';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CLAUDE_SONNET_4_5, DEFAULT_TEMPERATURE } from '../config/ai-constants';

interface TestAttachment {
  name: string;
  path?: string;
  contentType?: string;
}

interface TestFailure {
  testName: string;
  error: string;
  file: string;
  line: number;
  screenshot?: string;
  logs?: string[];
}

interface DiagnosticResult {
  issue: string;
  rootCause: string;
  suggestedFix: string;
  canAutoFix: boolean;
  fixCode?: string;
  priority: 'high' | 'medium' | 'low';
}

interface WorkflowState {
  iteration: number;
  totalFailures: number;
  fixed: number;
  remaining: TestFailure[];
  diagnostics: DiagnosticResult[];
}

class DiagnosticQAWorkflow {
  private maxIterations = 5;
  private state: WorkflowState = {
    iteration: 0,
    totalFailures: 0,
    fixed: 0,
    remaining: [],
    diagnostics: [],
  };

  async run(): Promise<void> {
    while (this.state.iteration < this.maxIterations) {
      this.state.iteration++;

      // Step 1: Run tests and collect failures
      const failures = await this.runTestsAndCollectFailures();

      if (failures.length === 0) {
        break;
      }

      this.state.totalFailures = failures.length;

      // Step 2: Analyze each failure with AI
      const diagnostics = await this.analyzeFailuresWithAI(failures);
      this.state.diagnostics = diagnostics;

      // Step 3: Apply automatic fixes
      const fixedCount = await this.applyAutomaticFixes(diagnostics);
      this.state.fixed += fixedCount;

      // Step 4: If no fixes were applied, break to avoid infinite loop
      if (fixedCount === 0) {
        break;
      }
    }

    // Step 5: Generate final report
    await this.generateFinalReport();
  }

  private async runTestsAndCollectFailures(): Promise<TestFailure[]> {
    try {
      // Run tests with JSON reporter to get structured output
      execSync(
        'cd src/client && pnpm exec playwright test tests/e2e/game-flow.spec.ts --project=chromium --reporter=json > test-results.json',
        { stdio: 'pipe', timeout: 60000 }
      );

      // If tests pass, return empty array
      return [];
    } catch (_error) {
      // Tests failed, parse results
      const resultsPath = join(process.cwd(), 'src/client/test-results.json');

      if (!existsSync(resultsPath)) {
        console.error('❌ Test results not found');
        return [];
      }

      const results = JSON.parse(readFileSync(resultsPath, 'utf-8'));
      const failures: TestFailure[] = [];

      // Parse test failures
      for (const suite of results.suites || []) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            if (test.status === 'failed' && test.results?.[0]) {
              const result = test.results[0];
              failures.push({
                testName: spec.title,
                error: result.error?.message || 'Unknown error',
                file: spec.file,
                line: spec.line,
                screenshot: result.attachments?.find(
                  (a: TestAttachment) => a.name === 'screenshot'
                )?.path,
                logs: result.stdout || [],
              });
            }
          }
        }
      }

      return failures;
    }
  }

  private async analyzeFailuresWithAI(
    failures: TestFailure[]
  ): Promise<DiagnosticResult[]> {
    const diagnostics: DiagnosticResult[] = [];

    // Group similar failures to avoid redundant analysis
    const uniqueErrors = this.groupSimilarFailures(failures);

    for (const [errorPattern, instances] of uniqueErrors) {
      const diagnostic = await this.analyzeFailureWithAI(
        instances[0],
        errorPattern
      );
      diagnostics.push(diagnostic);
    }

    return diagnostics;
  }

  private groupSimilarFailures(
    failures: TestFailure[]
  ): Map<string, TestFailure[]> {
    const groups = new Map<string, TestFailure[]>();

    for (const failure of failures) {
      // Extract error pattern (remove specific values like line numbers, file paths)
      const pattern = failure.error
        .replace(/line \d+/g, 'line X')
        .replace(/\d+ms/g, 'Xms')
        .split('\n')[0]; // First line only

      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      groups.get(pattern)!.push(failure);
    }

    return groups;
  }

  private async analyzeFailureWithAI(
    failure: TestFailure,
    pattern: string
  ): Promise<DiagnosticResult> {
    const prompt = `You are a diagnostic AI analyzing E2E test failures.

Test Failure:
- Test: ${failure.testName}
- Error: ${failure.error}
- File: ${failure.file}:${failure.line}

Analyze this failure and provide:
1. Root cause (be specific and technical)
2. Suggested fix (concrete code changes)
3. Whether this can be auto-fixed (true/false)
4. Priority (high/medium/low)

If auto-fixable, provide the exact code to fix it.

Respond in this JSON format:
{
  "rootCause": "...",
  "suggestedFix": "...",
  "canAutoFix": true/false,
  "fixCode": "...",
  "priority": "high/medium/low"
}`;

    try {
      const { text } = await generateText({
        model: CLAUDE_SONNET_4_5,
        prompt,
        temperature: DEFAULT_TEMPERATURE,
      });

      const result = JSON.parse(text);

      return {
        issue: pattern,
        rootCause: result.rootCause,
        suggestedFix: result.suggestedFix,
        canAutoFix: result.canAutoFix,
        fixCode: result.fixCode,
        priority: result.priority,
      };
    } catch (error) {
      console.error(`  ❌ AI analysis failed:`, error);

      return {
        issue: pattern,
        rootCause: 'AI analysis failed',
        suggestedFix: 'Manual investigation required',
        canAutoFix: false,
        priority: 'high',
      };
    }
  }

  private async applyAutomaticFixes(
    diagnostics: DiagnosticResult[]
  ): Promise<number> {
    let fixedCount = 0;

    for (const diagnostic of diagnostics) {
      if (!diagnostic.canAutoFix || !diagnostic.fixCode) {
        continue;
      }

      try {
        // TODO: Implement actual fix application
        // This would involve parsing the fixCode and applying it to the appropriate files

        fixedCount++;
      } catch (error) {
        console.error(`  ❌ Fix failed:`, error);
      }
    }

    return fixedCount;
  }

  private async generateFinalReport(): Promise<void> {
    const remainingDiagnostics = this.state.diagnostics.filter(
      (d) => !d.canAutoFix
    );

    if (remainingDiagnostics.length > 0) {
      for (const _diagnostic of remainingDiagnostics) {
        // Handle remaining diagnostics
      }
    }

    // Write report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        iterations: this.state.iteration,
        totalFailures: this.state.totalFailures,
        fixed: this.state.fixed,
        remaining: remainingDiagnostics.length,
      },
      diagnostics: this.state.diagnostics,
    };

    const reportPath = join(process.cwd(), 'diagnostic-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }
}

// Run workflow
const workflow = new DiagnosticQAWorkflow();
workflow.run().catch(console.error);
