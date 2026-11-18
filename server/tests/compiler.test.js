import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRequirementsLocally, inferTaskType } from '../services/inputAnalysisService.js';
import { evaluatePackage } from '../services/evaluationService.js';
import { selectByMMR, calculateJaccardSimilarity } from '../services/retrievalService.js';

test('inferTaskType correctly identifies coding, research, app development, and documentation', () => {
  assert.equal(inferTaskType('Fix this React bug causing infinite rerenders in useEffect'), 'coding_and_debugging');
  assert.equal(inferTaskType('Build a full-stack SaaS dashboard with Tailwind and auth'), 'website_and_application_development');
  assert.equal(inferTaskType('Compare recent papers and sources on quantum error correction'), 'research_and_fact_finding');
  assert.equal(inferTaskType('Summarize this legal contract PDF and extract indemnity clauses'), 'document_analysis_and_summarization');
});

test('analyzeRequirementsLocally decomposes raw request into structured requirements', () => {
  const request = 'Build a responsive portfolio website for photographers. Must not use paid plugins. Target audience: freelance creators.';
  const reqs = analyzeRequirementsLocally(request);
  assert.equal(reqs.task_type, 'website_and_application_development');
  assert.ok(reqs.objective.includes('Build a responsive portfolio website'));
  assert.ok(reqs.intended_audience.toLowerCase().includes('freelance creators'));
  assert.ok(reqs.constraints.some((c) => c.toLowerCase().includes('must not use paid plugins') || c.toLowerCase().includes('paid')));
});

test('calculateJaccardSimilarity measures token overlap correctly', () => {
  const termsA = ['react', 'component', 'state'];
  const termsB = ['react', 'component', 'props'];
  const sim = calculateJaccardSimilarity(termsA, termsB);
  // intersection: 2 ('react', 'component'), union: 4 ('react', 'component', 'state', 'props') => 2/4 = 0.5
  assert.equal(sim, 0.5);
});

test('selectByMMR chooses diverse items without redundant repetitions', () => {
  const candidates = [
    { chunkId: '1', bm25Score: 10, terms: ['alpha', 'beta', 'gamma'] },
    { chunkId: '2', bm25Score: 9.8, terms: ['alpha', 'beta', 'gamma'] }, // identical terms, redundant
    { chunkId: '3', bm25Score: 8.5, terms: ['delta', 'epsilon', 'zeta'] } // different terms, diverse
  ];
  const selected = selectByMMR(candidates, 2, 0.7);
  assert.equal(selected.length, 2);
  assert.equal(selected[0].chunkId, '1');
  assert.equal(selected[1].chunkId, '3'); // selected candidate 3 over redundant candidate 2!
});

test('evaluatePackage scores compliant prompt and detects missing elements', () => {
  const profile = { id: 'claude', name: 'Claude' };
  const requirements = {
    objective: 'Build an offline sync architecture for mobile apps',
    must_have_requirements: ['Conflict resolution protocol', 'Local SQLite cache'],
    constraints: ['Must operate without cloud access']
  };
  const goodPrompt = `<role>Architect</role>\n<task_objective>Build an offline sync architecture for mobile apps</task_objective>\n<instructions>1. Conflict resolution protocol\n2. Local SQLite cache</instructions>\n<constraints>Must operate without cloud access</constraints>\n<output_format>Markdown specification</output_format>`;

  const evalResult = evaluatePackage({
    originalRequest: 'Build an offline sync architecture',
    requirements,
    profile,
    optimizedPrompt: goodPrompt,
    retrievedContext: {}
  });

  assert.ok(evalResult.passed);
  assert.ok(evalResult.score >= 80);
  assert.ok(evalResult.preservesIntent);
  assert.ok(evalResult.coversConstraints);
});
