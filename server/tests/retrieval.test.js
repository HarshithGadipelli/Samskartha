import test from 'node:test';
import assert from 'node:assert/strict';
import { splitIntoChunks, deduplicateChunks, rankByBM25, tokenize } from '../services/retrievalService.js';

test('tokenize removes common stop words and lowercases terms', () => {
  assert.deepEqual(tokenize('The QUICK prompt for AI'), ['quick', 'prompt', 'ai']);
});

test('splitIntoChunks produces overlapping chunks within a bounded size', () => {
  const input = ('A useful sentence about prompt engineering. ').repeat(100);
  const chunks = splitIntoChunks(input, 300, 40);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.content.length <= 301));
});

test('deduplicateChunks removes normalized duplicate content', () => {
  const chunks = [{ content: 'Same   text' }, { content: 'same text' }, { content: 'Different text' }];
  assert.equal(deduplicateChunks(chunks).length, 2);
});

test('BM25 ranks matching context above unrelated context', () => {
  const docs = [
    { content: 'Prompt engineering optimizes clear task instructions.' },
    { content: 'A recipe for vegetable soup.' }
  ];
  const ranked = rankByBM25('prompt engineering task', docs, 2);
  assert.equal(ranked[0].content, docs[0].content);
});

test('retrieveContext processes uploaded context files and extracts evidence', async () => {
  const { retrieveContext } = await import('../services/retrievalService.js');
  const mockRequirements = {
    objective: 'Build an authentication system with OAuth2 and JWT',
    task_type: 'coding_and_debugging',
    functional_requirements: ['OAuth2 flow', 'JWT refresh tokens']
  };
  const mockProfile = {
    id: 'chatgpt',
    name: 'ChatGPT',
    promptStyle: 'Clear step-by-step instructions',
    references: [{ title: 'OpenAI Prompt Guide', url: 'https://platform.openai.com/docs' }]
  };
  const mockFiles = [
    {
      originalName: 'auth_spec.txt',
      text: 'OAuth2 authorization server guidelines. Tokens must use RS256 signatures with 15-minute expiration windows. Refresh tokens must be rotated on every redemption cycle.'
    }
  ];

  const result = retrieveContext(mockRequirements, mockProfile, mockFiles);
  assert.equal(result.uploadedFileCount, 1);
  assert.ok(result.chunkCount >= 1);
  assert.ok(result.compactSummary.includes('auth_spec.txt') || result.compactSummary.includes('OAuth2'));
  assert.ok(result.detailedPackage.includes('auth_spec.txt'));
  assert.ok(result.detailedPackage.includes('RS256'));
});

