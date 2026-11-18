export function compileGemini(ir) {
  const {
    objective,
    role,
    requirements = [],
    constraints = [],
    instructions = [],
    contextSummary,
    expectedOutput,
    qualityCriteria = [],
    boundaries = [],
    profileRules = []
  } = ir;

  const sections = [
    `## Task Objective\n${objective}`,

    `## Role & Persona\nAct as: ${role || 'Lead Technical Specialist'}. Deliver direct, high-impact solutions with zero fluff.`,

    `## Direct Instructions\n${instructions.length ? instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n') : '1. Directly execute the objective following the listed requirements.\n2. Keep output focused, actionable, and structured.'}`,

    `## Context & Reference Inputs\n${contextSummary || 'No external documents supplied. Ground response in verified technical facts.'}`,

    `## Functional & Technical Requirements\n${requirements.length ? requirements.map((r, i) => `- [REQ-${i + 1}] ${r}`).join('\n') : '- Execute requested task comprehensively.'}`,

    `## Constraints & Boundaries\n${constraints.length ? constraints.map((c) => `- ${c}`).join('\n') : '- Adhere to scope boundaries.'}\n${boundaries.map((b) => `- Boundary: ${b}`).join('\n')}`,

    `## Platform Strategies (Gemini Verified Rules)\n${profileRules.map((pr) => `- ${pr.title}: ${pr.description}`).join('\n')}`,

    `## Output Specifications & Acceptance Criteria\n${expectedOutput || 'Structured Markdown format.'}\n${qualityCriteria.map((q) => `- Acceptance: ${q}`).join('\n')}`
  ];

  return sections.join('\n\n');
}
