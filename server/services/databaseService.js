import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPlatformProfiles, listTaskTemplates, listKnowledgeSources, listBenchmarks } from './profileRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Real-time in-memory history cache
const generationHistory = [];
const customRules = [];
const knowledgeChunksCache = [];

// Populate initial knowledge chunks cache from platform profiles
async function initializeKnowledgeChunks() {
  if (knowledgeChunksCache.length > 0) return;
  const profiles = await listPlatformProfiles();
  for (const profile of profiles) {
    // Add profile strategy chunk
    knowledgeChunksCache.push({
      chunkId: `chunk-prof-${profile.id}-01`,
      platformId: profile.id,
      title: `${profile.name} Core Prompting Strategy`,
      category: 'platform_strategy',
      content: profile.promptStyle,
      sourceUrl: profile.url,
      lastVerified: profile.lastVerified || '2026-11-06'
    });

    // Add verified rules chunks
    for (const rule of profile.rules || []) {
      knowledgeChunksCache.push({
        chunkId: `chunk-rule-${rule.ruleId}`,
        platformId: profile.id,
        ruleId: rule.ruleId,
        title: rule.title,
        category: 'platform_rule',
        content: rule.description,
        sourceUrl: rule.sourceUrl,
        sourceTitle: rule.sourceTitle,
        lastVerified: rule.lastVerified || '2026-11-06'
      });
    }
  }
}

initializeKnowledgeChunks().catch(console.error);

export async function getDatabaseStats() {
  await initializeKnowledgeChunks();
  const profiles = await listPlatformProfiles();
  const templates = await listTaskTemplates();
  const sources = await listKnowledgeSources();
  const benchmarks = await listBenchmarks();

  return {
    collections: {
      platform_profiles: profiles.length,
      platform_rules: profiles.reduce((acc, p) => acc + (p.rules?.length || 0), 0) + customRules.length,
      task_templates: templates.length,
      knowledge_sources: sources.length,
      knowledge_chunks: knowledgeChunksCache.length,
      benchmark_cases: benchmarks.length,
      saved_packages: generationHistory.length
    },
    liveTelemetry: {
      activeMemoryBytes: process.memoryUsage().heapUsed,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }
  };
}

export async function getCollectionDocuments(collectionName) {
  await initializeKnowledgeChunks();
  switch (collectionName) {
    case 'platform_profiles':
      return await listPlatformProfiles();
    case 'platform_rules': {
      const profiles = await listPlatformProfiles();
      const allRules = [];
      for (const p of profiles) {
        for (const r of p.rules || []) {
          allRules.push({ ...r, platformName: p.name });
        }
      }
      return [...allRules, ...customRules];
    }
    case 'task_templates':
      return await listTaskTemplates();
    case 'knowledge_sources':
      return await listKnowledgeSources();
    case 'knowledge_chunks':
      return knowledgeChunksCache;
    case 'benchmark_cases':
      return await listBenchmarks();
    case 'saved_packages':
      return generationHistory;
    default:
      return [];
  }
}

export function savePackageToHistory(pkg) {
  const record = {
    id: pkg.id,
    createdAt: pkg.createdAt,
    platform: pkg.platform,
    taskType: pkg.requirements?.task_type,
    objective: pkg.requirements?.objective,
    mode: pkg.mode,
    score: pkg.qualityCheck?.score,
    promptLength: pkg.optimizedPrompt?.length || 0,
    package: pkg
  };
  // Prepend to history, max 50 records
  generationHistory.unshift(record);
  if (generationHistory.length > 50) {
    generationHistory.pop();
  }
  return record;
}

export function getGenerationHistory() {
  return generationHistory;
}

export function deleteHistoryItem(id) {
  const index = generationHistory.findIndex((h) => h.id === id);
  if (index !== -1) {
    generationHistory.splice(index, 1);
    return true;
  }
  return false;
}
