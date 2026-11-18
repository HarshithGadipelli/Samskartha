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

