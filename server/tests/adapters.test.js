import test from 'node:test';
import assert from 'node:assert/strict';
import { compilePromptWithAdapter, getSupportedPlatformIds } from '../services/platformAdapters/index.js';

const mockIR = {
  objective: 'Build an online learning platform for college students with assignment submission and grading.',
  taskType: 'website_and_application_development',
  audience: 'College students and university instructors',
  role: 'Lead Full-Stack Architect',
  instructions: [
    'Design the course management flow',
    'Specify responsive UI components',
    'Establish relational data schema'
  ],
  requirements: [
    'Course enrollment and syllabus viewer',
    'Assignment submission with deadline countdown',
    'Instructor grading portal with feedback'
  ],
  constraints: [
    'Responsive design for mobile and desktop',
    'Free-tier services and zero paid APIs'
  ],
  boundaries: [
    'Preserve standard accessibility guidelines (WCAG 2.1 AA)'
  ],
  contextSummary: 'Reference context: student cohort management specs.',
  expectedOutput: 'Complete implementation-ready specification.',
  qualityCriteria: ['Functional workflow clarity', 'Comprehensive error handling'],
  profileRules: [
    { ruleId: 'TEST-01', title: 'Rule Title', description: 'Sample verified platform rule.' }
  ]
};

test('getSupportedPlatformIds returns all six supported platforms', () => {
  const platforms = getSupportedPlatformIds();
  assert.deepEqual(platforms.sort(), ['chatgpt', 'claude', 'gemini', 'lovable', 'notebooklm', 'perplexity'].sort());
});

test('compileClaude produces XML-structured tags and delimiters', () => {
  const result = compilePromptWithAdapter('claude', mockIR);
  assert.ok(result.includes('<role>'));
  assert.ok(result.includes('</role>'));
  assert.ok(result.includes('<task_objective>'));
  assert.ok(result.includes('<instructions>'));
  assert.ok(result.includes('<output_format>'));
  assert.ok(result.includes(mockIR.objective));
});

test('compileLovable produces an application-building PRD specification', () => {
  const result = compilePromptWithAdapter('lovable', mockIR);
  assert.ok(result.includes('Product & Implementation Specification'));
  assert.ok(result.includes('UI/UX Design System'));
  assert.ok(result.includes('Data Models & Schema Requirements'));
  assert.ok(result.includes('Immutable Boundaries'));
  assert.ok(result.includes('Tailwind CSS'));
});

test('compileNotebookLM produces source-grounding instructions and user upload warning', () => {
  const result = compilePromptWithAdapter('notebooklm', mockIR);
  assert.ok(result.includes('NotebookLM Source Investigation Guide'));
  assert.ok(result.includes('User Action Required Before Pasting Prompt'));
  assert.ok(result.includes('Ensure you have created a Notebook in Google NotebookLM and uploaded your primary reference documents'));
  assert.ok(result.includes('INSUFFICIENT EVIDENCE IN NOTEBOOK SOURCES'));
});

test('compilePerplexity produces research questions, recency scope, and citation requirements', () => {
  const result = compilePromptWithAdapter('perplexity', mockIR);
  assert.ok(result.includes('Search Scope & Recency Window'));
  assert.ok(result.includes('Authoritative Source Preferences'));
  assert.ok(result.includes('In-text numbered citations'));
});

test('compileChatGPT produces ordered instructions, constraints, and boundary formatting', () => {
  const result = compilePromptWithAdapter('chatgpt', mockIR);
  assert.ok(result.includes('# Role & Expertise'));
  assert.ok(result.includes('# Task Instructions'));
  assert.ok(result.includes('# Constraints & Boundaries'));
  assert.ok(result.includes('# Expected Output Format'));
});

test('compileGemini produces direct actionable headers and output specifications', () => {
  const result = compilePromptWithAdapter('gemini', mockIR);
  assert.ok(result.includes('## Task Objective'));
  assert.ok(result.includes('## Direct Instructions'));
  assert.ok(result.includes('## Output Specifications & Acceptance Criteria'));
});
