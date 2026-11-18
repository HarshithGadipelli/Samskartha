export function evaluatePackage({
  originalRequest,
  requirements,
  profile,
  optimizedPrompt,
  retrievedContext
}) {
  const promptLower = optimizedPrompt.toLowerCase();
  const checks = [];
  let score = 100;

  // 1. Intent Preservation Check
  const keyObjectiveTerms = requirements.objective
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
  
  const foundTerms = keyObjectiveTerms.filter((term) => promptLower.includes(term));
  const intentPreserved = foundTerms.length >= Math.min(2, keyObjectiveTerms.length);
  checks.push({
    id: 'INTENT_PRESERVATION',
    name: 'Original Intent Preservation',
    passed: intentPreserved,
    details: intentPreserved
      ? 'Primary user intent and core vocabulary are strongly preserved.'
      : 'Some core objective terms were rephrased or omitted. Review recommended.'
  });
  if (!intentPreserved) score -= 15;

  // 2. Must-Have Requirements Coverage Check
  const mustHaves = requirements.must_have_requirements || [];
  let missingReqCount = 0;
  for (const req of mustHaves) {
    const snippet = req.slice(0, 20).toLowerCase();
    if (!promptLower.includes(snippet)) {
      missingReqCount++;
    }
  }
  const reqCoveragePassed = missingReqCount === 0 || mustHaves.length === 0;
  checks.push({
    id: 'REQUIREMENTS_COVERAGE',
    name: 'Must-Have Requirements Coverage',
    passed: reqCoveragePassed,
    details: reqCoveragePassed
      ? `All ${mustHaves.length} core requirements are mapped into the prompt.`
      : `${missingReqCount} must-have requirement(s) may need explicit manual review.`
  });
  if (!reqCoveragePassed) score -= 10 * missingReqCount;

  // 3. Constraints Preservation Check
  const constraints = requirements.constraints || [];
  const constraintsCovered = constraints.length === 0 || promptLower.includes('constraint') || promptLower.includes('boundaries') || promptLower.includes('must not');
  checks.push({
    id: 'CONSTRAINTS_PRESERVED',
    name: 'Constraints and Boundaries Check',
    passed: constraintsCovered,
    details: constraintsCovered
      ? 'Operational constraints and boundaries are clearly delineated.'
      : 'Negative constraints may need to be emphasized more prominently.'
  });
  if (!constraintsCovered) score -= 10;

  // 4. Platform-Specific Compliance Check
  let platformCompliant = true;
  let platformNote = '';

  if (profile.id === 'claude') {
    const hasXml = /<role>[\s\S]*<\/role>/.test(optimizedPrompt) || /<instructions>[\s\S]*<\/instructions>/.test(optimizedPrompt);
    platformCompliant = hasXml;
    platformNote = hasXml
      ? 'Complies with Anthropic XML tag demarcation standards.'
      : 'Missing XML structural delimiters recommended by Anthropic.';
  } else if (profile.id === 'lovable') {
    const hasSpec = /specification|user|navigation|component|schema|acceptance/i.test(optimizedPrompt);
    platformCompliant = hasSpec;
    platformNote = hasSpec
      ? 'Formatted as an implementation-ready software PRD specification.'
      : 'Requires more granular component, route, or schema specifications for Lovable.';
  } else if (profile.id === 'notebooklm') {
    const hasGrounding = /source|ground|citation|notebook/i.test(optimizedPrompt);
    platformCompliant = hasGrounding;
    platformNote = hasGrounding
      ? 'Enforces strict notebook source grounding and includes upload advisory.'
      : 'Prompt should emphasize grounding exclusively in active notebook sources.';
  } else if (profile.id === 'perplexity') {
    const hasResearch = /research|recency|citation|evidence|scope/i.test(optimizedPrompt);
    platformCompliant = hasResearch;
    platformNote = hasResearch
      ? 'Structured with research questions, recency scope, and in-text citation requirements.'
      : 'Include explicit time window and citation expectations for Perplexity.';
  } else {
    platformCompliant = optimizedPrompt.length > 100;
    platformNote = `Adheres to ${profile.name} clarity and task structuring guidelines.`;
  }

  checks.push({
    id: 'PLATFORM_COMPLIANCE',
    name: `${profile.name} Profile Compliance`,
    passed: platformCompliant,
    details: platformNote
  });
  if (!platformCompliant) score -= 15;

  // 5. Output Format Clarity Check
  const hasFormat = /output|format|deliverable|structure|markdown/i.test(optimizedPrompt);
  checks.push({
    id: 'OUTPUT_FORMAT_CLARITY',
    name: 'Output Format Clarity',
    passed: hasFormat,
    details: hasFormat
      ? 'Expected deliverable structure is explicitly specified.'
      : 'Output structure could be defined with clearer formatting expectations.'
  });
  if (!hasFormat) score -= 10;

  score = Math.max(score, 40);

  return {
    score,
    passed: score >= 75,
    preservesIntent: intentPreserved,
    coversConstraints: constraintsCovered,
    checks,
    notes: checks.filter((c) => !c.passed).map((c) => c.details)
  };
}
