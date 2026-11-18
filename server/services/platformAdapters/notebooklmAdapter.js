export function compileNotebookLM(ir) {
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
    `# NotebookLM Source Investigation Guide & Research Prompt`,

    `## [IMPORTANT] User Action Required Before Pasting Prompt:\nEnsure you have created a Notebook in Google NotebookLM and uploaded your primary reference documents (PDFs, Google Docs, transcripts, or notes) into that Notebook. NotebookLM grounds its answers directly in your uploaded notebook sources.`,

    `## 1. Core Research Inquiry\n${objective}`,

    `## 2. Lead Investigator Perspective\nYou are acting as a ${role || 'Principal Research Synthesizer & Forensic Document Analyst'}.\nGround every single assertion exclusively in the active sources of this notebook.`,

    `## 3. Key Investigation Sub-Questions\n${requirements.length ? requirements.map((r, i) => `Question ${i + 1}: ${r}`).join('\n') : 'Question 1: What are the fundamental principles and factual evidence detailed in the notebook sources?'}\n${instructions.map((ins, i) => `Sub-Question ${requirements.length + i + 1}: ${ins}`).join('\n')}`,

    `## 4. Background Reference Overview (from Samskartha Context Engine)\n${contextSummary || 'Synthesizing directly from user notebook uploads. Check uploaded documents for complete source material.'}`,

    `## 5. Strict Source-Grounding & Evidence Attribution Rules\n- Cite exact source names and page or section references for every factual finding.\n- If a question cannot be definitively answered from the active notebook sources, explicitly state: "INSUFFICIENT EVIDENCE IN NOTEBOOK SOURCES" rather than interpolating or hypothesizing.\n${constraints.map((c) => `- Constraint: ${c}`).join('\n')}\n${profileRules.map((pr) => `- Directive: ${pr.description}`).join('\n')}`,

    `## 6. Desired Synthesis & Report Format\n1. Executive Synthesis addressing the primary research inquiry.\n2. Detailed Source-Grounded Findings categorized by sub-topic with inline citations.\n3. Thematic Matrix or Timeline where chronological or comparative flow is relevant.\n4. Identified Knowledge Gaps and Contradictions across sources.\n\n${expectedOutput || ''}`
  ];

  return sections.join('\n\n');
}
