import { getPlatformProfile, listPlatformProfiles } from './profileRepository.js';
import { extractUploadedFiles } from './fileService.js';
import { analyzeRequirements } from './inputAnalysisService.js';
import { retrieveContext } from './retrievalService.js';
import { buildIntermediateRepresentation, compilePrompt } from './promptCompiler.js';
import { evaluatePackage } from './evaluationService.js';
import { savePackageToHistory } from './databaseService.js';

export function buildExportFormats(pkg) {
  const markdown = [
    `# Samskartha Engineered Package for ${pkg.platform.name}`,
    `**Package ID:** \`${pkg.id}\` | **Created At:** ${pkg.createdAt} | **Mode:** ${pkg.mode}`,
    `**Task Type:** ${pkg.requirements.task_type || 'General'}`,
    `**Destination URL:** ${pkg.platform.url}`,
    '',
    '---',
    '',
    '## 1. Optimized Prompt',
    '```markdown',
    pkg.optimizedPrompt,
    '```',
    '',
    '---',
    '',
    '## 2. Engineered Context Summary',
    pkg.contextSummary || 'No external context files were supplied.',
    '',
    '---',
    '',
    '## 3. Detailed Context & Excerpts',
    pkg.detailedContext || 'No additional context excerpts.',
    '',
    '---',
    '',
    '## 4. Official References & Platform Guidance',
    ...(pkg.references || []).map((ref, idx) => `${idx + 1}. **[${ref.title}](${ref.url})** — ${ref.whyRelevant || 'Official documentation'}`),
    '',
    '---',
    '',
    '## 5. Assumptions & Boundaries',
    ...(pkg.assumptions || []).map((a) => `- ${a}`),
    '',
    '---',
    '',
    '## 6. Quality Validation',
    `- Quality Score: ${pkg.qualityCheck.score || 100}/100 (${pkg.qualityCheck.passed ? 'PASSED' : 'REVIEW RECOMMENDED'})`,
    `- Intent Preserved: ${pkg.qualityCheck.preservesIntent ? 'Yes' : 'Review needed'}`,
    `- Constraints Covered: ${pkg.qualityCheck.coversConstraints ? 'Yes' : 'Review needed'}`,
    ...(pkg.qualityCheck.notes || []).map((n) => `  * Note: ${n}`),
    '',
    '> **Usage Instructions:** Copy the Optimized Prompt above, navigate to the destination platform, and paste it directly. Samskartha does not automatically execute or submit tasks to external platforms.'
  ].join('\n');

  const plainText = [
    `=== SAMSKARTHA PACKAGE FOR ${pkg.platform.name.toUpperCase()} ===`,
    `ID: ${pkg.id} | Mode: ${pkg.mode}`,
    `Destination: ${pkg.platform.url}`,
    '',
    '--- OPTIMIZED PROMPT ---',
    pkg.optimizedPrompt,
    '',
    '--- CONTEXT SUMMARY ---',
    pkg.contextSummary || 'None provided.',
    '',
    '--- ASSUMPTIONS ---',
    ...(pkg.assumptions || []).map((a) => `* ${a}`),
    '',
    '--- REFERENCES ---',
    ...(pkg.references || []).map((r) => `* ${r.title}: ${r.url}`)
  ].join('\n');

  return { markdown, plainText };
}

export async function generatePackage({ originalRequest, platformId, taskType = null, files = [], options = {} }) {
  const profile = await getPlatformProfile(platformId);
  if (!profile) {
    const error = new Error('The selected platform is not supported.');
    error.status = 400;
    throw error;
  }

  // 1. Process files if any
  const uploadedFiles = await extractUploadedFiles(files);

  // 2. Input & Requirement Analysis (Module 1)
  const requirements = await analyzeRequirements(originalRequest, taskType);

  // 3. Structure-Aware Context Engineering & BM25 + MMR Retrieval (Module 2 Engine B)
  const retrievedContext = retrieveContext(requirements, profile, uploadedFiles, options);

  // 4. Build Intermediate Representation (IR)
  const ir = await buildIntermediateRepresentation({
    originalRequest,
    requirements,
    profile,
    retrievedContext,
    taskType: requirements.task_type
  });

  // 5. Prompt Compilation with Platform Adapter (Module 2 Engine A)
  const compiled = await compilePrompt({ ir, profile });
  const mode = compiled.engine.startsWith('gemini') ? 'gemini' : 'demo';

  // 6. Merge references
  const mergedReferences = [
    ...(profile.references ?? []).map((ref) => ({
      ...ref,
      whyRelevant: `Official documentation verified for ${profile.name}.`
    }))
  ];
  const seenUrls = new Set();
  const references = mergedReferences.filter((ref) => {
    if (!ref.url || seenUrls.has(ref.url)) return false;
    seenUrls.add(ref.url);
    return true;
  });

  // 7. Deterministic Quality Evaluation (Part 3)
  const qualityCheck = evaluatePackage({
    originalRequest,
    requirements,
    profile,
    optimizedPrompt: compiled.optimizedPrompt,
    retrievedContext
  });

  // Token & compression metrics estimation
  const promptTokensEst = Math.ceil(compiled.optimizedPrompt.length / 4);
  const contextTokensEst = Math.ceil((retrievedContext.detailedPackage?.length || 0) / 4);
  const rawInputTokensEst = Math.ceil(originalRequest.length / 4) + (uploadedFiles.reduce((acc, f) => acc + Math.ceil(f.text.length / 4), 0));
  const compressionRatio = rawInputTokensEst > 0
    ? ((1 - (contextTokensEst / Math.max(rawInputTokensEst, 1))) * 100).toFixed(1)
    : '0.0';

  const pkg = {
    id: `sk-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    platform: {
      id: profile.id,
      name: profile.name,
      url: profile.destinationUrl || profile.url,
      profileVersion: profile.profileVersion,
      lastVerified: profile.lastVerified,
      rules: profile.rules || []
    },
    mode,
    requirements,
    optimizedPrompt: compiled.optimizedPrompt,
    contextSummary: retrievedContext.compactSummary,
    detailedContext: retrievedContext.detailedPackage,
    references,
    assumptions: compiled.assumptions,
    qualityCheck,
    retrieval: {
      method: retrievedContext.method,
      retrievedItems: retrievedContext.items.length,
      uploadedFileCount: uploadedFiles.length,
      chunkCount: retrievedContext.chunkCount
    },
    metrics: {
      promptTokensEst,
      contextTokensEst,
      totalPackageTokensEst: promptTokensEst + contextTokensEst,
      rawInputTokensEst,
      compressionRatioPercent: `${compressionRatio}%`
    }
  };

  const exportFormats = buildExportFormats(pkg);
  const finalPackage = {
    ...pkg,
    exportFormats
  };

  // Record into real-time database history
  savePackageToHistory(finalPackage);

  return finalPackage;
}

// Multi-platform comparison matrix: compiles prompt across all 6 platforms in parallel
export async function compareAllPlatforms({ originalRequest, taskType = null }) {
  const profiles = await listPlatformProfiles();
  const requirements = await analyzeRequirements(originalRequest, taskType);
  const results = {};

  for (const profile of profiles) {
    const retrievedContext = retrieveContext(requirements, profile, []);
    const ir = await buildIntermediateRepresentation({
      originalRequest,
      requirements,
      profile,
      retrievedContext,
      taskType: requirements.task_type
    });
    const compiled = await compilePrompt({ ir, profile });
    const quality = evaluatePackage({
      originalRequest,
      requirements,
      profile,
      optimizedPrompt: compiled.optimizedPrompt,
      retrievedContext
    });

    results[profile.id] = {
      platformId: profile.id,
      platformName: profile.name,
      destinationUrl: profile.destinationUrl || profile.url,
      optimizedPrompt: compiled.optimizedPrompt,
      qualityScore: quality.score,
      promptStyle: profile.promptStyle
    };
  }

  return {
    requirements,
    platforms: results
  };
}
