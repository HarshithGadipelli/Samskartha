export function compileChatGPT(ir) {
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

  const reqList = requirements.length
    ? requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '1. Execute the primary objective directly adhering to industry standards.';

  const constrList = constraints.length
    ? constraints.map((c) => `- ${c}`).join('\n')
    : '- Adhere strictly to the requested scope without extraneous additions.';

  const rulesList = profileRules.length
    ? profileRules.map((pr) => `- ${pr.title}: ${pr.description}`).join('\n')
    : '- Break complex tasks into ordered sequential steps.\n- Deliver direct and actionable output.';

  const boundsList = boundaries.length
    ? boundaries.map((b) => `- ${b}`).join('\n')
    : '- Do not speculate on missing facts; state uncertainties explicitly.';

  const sections = [
    `# Role & Expertise\nYou are operating as: ${role || 'Expert Solution Architect'}.\nApply deep domain knowledge, disciplined execution, and structured communication.`,
    
    `# Objective\n${objective}`,

    `# Task Instructions\n${instructions.length ? instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n') : '1. Carefully review all supplied requirements.\n2. Formulate a structured, complete solution.\n3. Verify all constraints before finalizing response.'}`,

    `# Reference Context\n${contextSummary || 'No external documents supplied. Rely on established authoritative domain knowledge.'}`,

    `# Requirements & Functional Specifications\n${reqList}`,

    `# Constraints & Boundaries\n${constrList}\n${boundsList}`,

    `# Platform Guidelines (ChatGPT)\n${rulesList}`,

    `# Expected Output Format\n${expectedOutput || 'Structured Markdown with clear headings, organized lists, and clean formatting.'}`,

    `# Quality Criteria\n${qualityCriteria.length ? qualityCriteria.map((q) => `- ${q}`).join('\n') : '- Comprehensive intent coverage.\n- Verified factuality with zero hallucination.'}`
  ];

  return sections.join('\n\n');
}
