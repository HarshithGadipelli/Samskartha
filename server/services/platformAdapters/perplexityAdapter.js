export function compilePerplexity(ir) {
  const {
    objective,
    role,
    requirements = [],
    constraints = [],
    instructions = [],
    contextSummary,
    expectedOutput,
    qualityCriteria = [],
    profileRules = []
  } = ir;

  const sections = [
    `# Research Objective & Primary Question\n${objective}`,

    `# Lead Analyst Perspective\nYou are acting as a ${role || 'Senior Intelligence & Research Analyst'}.\nConduct rigorous web-grounded research, cross-referencing multiple authoritative sources.`,

    `# Search Scope & Recency Window\n- Scope: Comprehensive global research focusing on validated data and official releases.\n- Recency: Prioritize current information (2024-2026) and state effective dates for data points.\n- Negative Constraints: Avoid unsourced blog posts, speculative social media claims, or unverified secondary quotes.`,

    `# Authoritative Source Preferences\n- Prioritize peer-reviewed academic literature, official documentation, government regulatory filings, and primary source code repositories.\n- Filter out unverified secondary commentary and content farm aggregators.`,

    `# Key Research Questions\n${requirements.length ? requirements.map((r, i) => `${i + 1}. ${r}`).join('\n') : '1. What are the validated facts regarding the research objective?'}\n${instructions.map((ins, i) => `${requirements.length + i + 1}. ${ins}`).join('\n')}`,

    `# Baseline Context\n${contextSummary || 'No preliminary internal documents. Conduct an independent primary search across verified sources.'}`,

    `# Evidence Requirements & Comparison Criteria\n${constraints.length ? constraints.map((c) => `- Constraint: ${c}`).join('\n') : '- Compare multiple viewpoints with concrete metrics.'}\n${profileRules.map((pr) => `- Research Directive: ${pr.description}`).join('\n')}`,

    `# Expected Output & Citation Standards\n1. Executive Summary with direct answer to the core question.\n2. In-Depth Comparative Analysis supported by clear Markdown tables where applicable.\n3. In-text numbered citations linked to primary source URLs.\n4. Explicit section on Remaining Uncertainties and Conflicting Evidence.\n\n${expectedOutput || ''}`
  ];

  return sections.join('\n\n');
}
