import type { PackageResult } from './types';

export function buildFullPackage(result: PackageResult): string {
  if (result.exportFormats?.markdown) {
    return result.exportFormats.markdown;
  }

  const refs = result.references.length
    ? result.references.map((ref, idx) => `${idx + 1}. **[${ref.title}](${ref.url})**${ref.whyRelevant ? ` — ${ref.whyRelevant}` : ''}`).join('\n')
    : 'No external references included.';

  const assumptions = result.assumptions.length
    ? result.assumptions.map((item) => `- ${item}`).join('\n')
    : '- None stated.';

  return [
    `# Samskartha Engineered Package — ${result.platform.name}`,
    `**Package ID:** \`${result.id}\` | **Generated:** ${new Date(result.createdAt).toLocaleString()}`,
    `**Mode:** ${result.mode === 'gemini' ? 'Gemini AI Assisted' : 'Deterministic Demo Mode'}`,
    `**Destination Platform:** [${result.platform.name}](${result.platform.url})`,
    '',
    '---',
    '',
    '## 1. Optimized Prompt',
    result.optimizedPrompt,
    '',
    '---',
    '',
    '## 2. Engineered Context Summary',
    result.contextSummary || 'No external context files were supplied.',
    '',
    '---',
    '',
    '## 3. Detailed Context Reference',
    result.detailedContext || 'No additional context excerpts.',
    '',
    '---',
    '',
    '## 4. Official References & Platform Guidance',
    refs,
    '',
    '---',
    '',
    '## 5. Assumptions & Boundaries',
    assumptions,
    '',
    '---',
    '',
    '## 6. Usage & Handoff Instructions',
    `1. Copy the optimized prompt above.`,
    `2. Open ${result.platform.name} at ${result.platform.url}.`,
    `3. Paste (Ctrl+V / Cmd+V) the package directly into the prompt box.`,
    `> Note: Samskartha prepares and optimizes your prompt and context package. It does not execute or submit tasks to external platforms.`
  ].join('\n');
}
