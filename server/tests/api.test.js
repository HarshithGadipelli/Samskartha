import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePackage } from '../services/generationService.js';
import { listPlatformProfiles, listTaskTemplates, listKnowledgeSources, listBenchmarks } from '../services/profileRepository.js';

test('listPlatformProfiles loads all six profiles with rules', async () => {
  const profiles = await listPlatformProfiles();
  assert.equal(profiles.length, 6);
  for (const p of profiles) {
    assert.ok(p.id);
    assert.ok(p.name);
    assert.ok(p.url);
    assert.ok(Array.isArray(p.rules));
    assert.ok(p.rules.length > 0);
  }
});

test('listTaskTemplates loads all eight task templates', async () => {
  const templates = await listTaskTemplates();
  assert.equal(templates.length, 8);
  for (const t of templates) {
    assert.ok(t.id);
    assert.ok(t.name);
    assert.ok(Array.isArray(t.requiredSections));
  }
});

test('listKnowledgeSources aggregates verified references across platforms', async () => {
  const sources = await listKnowledgeSources();
  assert.ok(sources.length >= 6);
  assert.ok(sources.every((s) => s.url && s.title && s.platformId));
});

test('listBenchmarks returns valid benchmark cases', async () => {
  const benchmarks = await listBenchmarks();
  assert.ok(benchmarks.length >= 15);
});

test('generatePackage produces complete deliverable for ChatGPT in demo mode', async () => {
  const result = await generatePackage({
    originalRequest: 'Create an automated CI/CD pipeline script for Docker container deployments to a Kubernetes cluster with zero downtime rolling updates.',
    platformId: 'chatgpt'
  });

  assert.ok(result.id.startsWith('sk-'));
  assert.equal(result.platform.id, 'chatgpt');
  assert.equal(result.mode, 'demo');
  assert.ok(result.optimizedPrompt.length > 100);
  assert.ok(result.optimizedPrompt.includes('CI/CD pipeline'));
  assert.ok(result.requirements);
  assert.ok(result.qualityCheck.score > 70);
  assert.ok(result.exportFormats.markdown);
  assert.ok(result.exportFormats.plainText);
});

test('generatePackage produces complete deliverable for Lovable with PRD format', async () => {
  const result = await generatePackage({
    originalRequest: 'Build a task management kanban board with drag and drop cards and dark mode support.',
    platformId: 'lovable'
  });

  assert.equal(result.platform.id, 'lovable');
  assert.ok(result.optimizedPrompt.includes('Product & Implementation Specification'));
  assert.ok(result.optimizedPrompt.includes('Navigation, Routing'));
  assert.ok(result.optimizedPrompt.includes('UI/UX Design System'));
});

test('generatePackage produces complete deliverable for Claude with XML tags', async () => {
  const result = await generatePackage({
    originalRequest: 'Perform a forensic analysis of a database deadlock scenario in PostgreSQL.',
    platformId: 'claude'
  });

  assert.equal(result.platform.id, 'claude');
  assert.ok(result.optimizedPrompt.includes('<role>'));
  assert.ok(result.optimizedPrompt.includes('<task_objective>'));
  assert.ok(result.optimizedPrompt.includes('<instructions>'));
});
