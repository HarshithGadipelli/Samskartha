export function compileClaude(ir) {
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

  const reqFormatted = requirements.map((r, i) => `  <requirement id="REQ-${i + 1}">${r}</requirement>`).join('\n');
  const constrFormatted = constraints.map((c, i) => `  <constraint id="CON-${i + 1}">${c}</constraint>`).join('\n');
  const rulesFormatted = profileRules.map((pr) => `  <rule id="${pr.ruleId}">${pr.title}: ${pr.description}</rule>`).join('\n');

  return `<role>
You are an expert ${role || 'Lead Architect and Technical Strategist'}.
Execute this task with meticulous reasoning, explicit verification of edge cases, and high precision.
</role>

<task_objective>
${objective}
</task_objective>

<context>
${contextSummary || 'No external context documents provided. Work strictly with verifiable domain facts.'}
</context>

<instructions>
${instructions.length ? instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n') : '1. Parse and validate all technical and functional requirements.\n2. Construct the solution systematically.\n3. Validate against all negative constraints.'}
</instructions>

<requirements>
${reqFormatted || '  <requirement id="REQ-1">Directly satisfy the primary user intent.</requirement>'}
</requirements>

<constraints>
${constrFormatted || '  <constraint id="CON-1">Strict adherence to specified scope.</constraint>'}
${boundaries.length ? boundaries.map((b, i) => `  <boundary id="BND-${i + 1}">${b}</boundary>`).join('\n') : ''}
</constraints>

<platform_guidelines>
${rulesFormatted || '  <rule>Use explicit hierarchical structure and clear separation of concerns.</rule>'}
</platform_guidelines>

<reasoning_guidelines>
- Think systematically through structural dependencies before outputting the deliverable.
- Clearly differentiate confirmed empirical facts from assumptions.
</reasoning_guidelines>

<output_format>
${expectedOutput || 'Provide a comprehensive deliverable with clean Markdown headings and verified criteria.'}
</output_format>`;
}
