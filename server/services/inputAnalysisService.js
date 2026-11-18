import { GoogleGenAI } from '@google/genai';

export const TASK_TYPES = [
  { id: 'research_and_fact_finding', name: 'Research and fact-finding' },
  { id: 'coding_and_debugging', name: 'Coding and debugging' },
  { id: 'website_and_application_development', name: 'Website and application development' },
  { id: 'writing_and_content_creation', name: 'Writing and content creation' },
  { id: 'document_analysis_and_summarization', name: 'Document analysis and summarization' },
  { id: 'planning_and_problem_solving', name: 'Planning and problem-solving' },
  { id: 'learning_and_educational_assistance', name: 'Learning and educational assistance' },
  { id: 'data_analysis', name: 'Data analysis' }
];

export function inferTaskType(text) {
  const normalized = text.toLowerCase();

  // 1. Research and fact-finding (papers, citations, comparative research, survey)
  if (/research|paper|sources|citations?|literature|survey|quantum|fact[- ]finding|state of the art/i.test(normalized)) {
    return 'research_and_fact_finding';
  }

  // 2. High-priority debugging / algorithmic / syntax
  if (/bug|debug|rerender|memory leak|deadlock|fix\s+(?:this|the|an)|stack\s*trace|exception|segfault|runtime error|syntax error|profiling|refactor|unit test/i.test(normalized)) {
    return 'coding_and_debugging';
  }

  // 3. Application & website development
  if (/website|application|app\b|full-stack|frontend|backend|saas|dashboard|ui\/ux|crud|login|database schema|react|vue|svelte|kanban/i.test(normalized)) {
    return 'website_and_application_development';
  }

  // 4. General coding
  if (/code|coding|function|algorithm|script|compile|syntax|typescript|python|c\+\+/i.test(normalized)) {
    return 'coding_and_debugging';
  }

  // 5. Document analysis & summarization
  if (/document|pdf|contract|agreement|transcript|summarize|summary|clause|audit|extract facts|synthesis/i.test(normalized)) {
    return 'document_analysis_and_summarization';
  }

  // 6. Data analysis
  if (/dataset|csv|sql|metrics|chart|visualization|regression|correlation|quantitative|statistics|clean data/i.test(normalized)) {
    return 'data_analysis';
  }

  // 7. Education & learning
  if (/learn|explain|tutorial|study guide|curriculum|concept|teach|beginner|feynman|quiz/i.test(normalized)) {
    return 'learning_and_educational_assistance';
  }

  // 8. Planning & strategy
  if (/plan|strategy|roadmap|milestone|schedule|problem-solving|decision tree|risk|contingency/i.test(normalized)) {
    return 'planning_and_problem_solving';
  }

  // 9. Writing & content creation
  if (/write|draft|essay|article|blog|story|copywriting|newsletter|tone|prose|whitepaper/i.test(normalized)) {
    return 'writing_and_content_creation';
  }

  return 'research_and_fact_finding';
}

function extractSentenceWith(text, patterns) {
  const sentences = text.split(/(?<=[.?!])\s+|\n+/);
  for (const sentence of sentences) {
    for (const pattern of patterns) {
      if (pattern.test(sentence)) return sentence.trim();
    }
  }
  return null;
}

export function analyzeRequirementsLocally(originalRequest, userTaskType = null) {
  const normalized = originalRequest.trim().replace(/\r/g, '');
  const taskType = userTaskType && userTaskType !== 'auto'
    ? userTaskType
    : inferTaskType(normalized);

  // Extract explicit audience (prioritizing specific markers over generic 'for')
  const specificAudienceMatch = normalized.match(/\b(?:target\s+audience|intended\s+(?:audience|for)|aimed\s+at)\s*[:]?\s*([a-zA-Z0-9\s,-]+?)(?=[.;,\n]|\band\b|$)/i);
  const fallbackAudienceMatch = normalized.match(/\b(?:audience|for)\s*[:]?\s*([a-zA-Z0-9\s,-]+?)(?=[.;,\n]|\band\b|$)/i);
  const audienceMatch = specificAudienceMatch || fallbackAudienceMatch;
  const audience = audienceMatch ? audienceMatch[1].trim() : 'General technical and domain practitioners';

  // Extract constraints
  const constraintMatches = [];
  const lines = normalized.split('\n');
  for (const line of lines) {
    if (/must not|don't|do not|never|without|limit|constraint|restrict|under|free-tier|no paid/i.test(line)) {
      constraintMatches.push(line.replace(/^[-*•\d.]+\s*/, '').trim());
    }
  }
  if (constraintMatches.length === 0) {
    const inlineConstraint = extractSentenceWith(normalized, [/must not/i, /do not/i, /free-tier/i, /without/i]);
    if (inlineConstraint) constraintMatches.push(inlineConstraint);
  }
  if (constraintMatches.length === 0) {
    constraintMatches.push('Ensure cross-platform compatibility and adhere strictly to specified scope.');
  }

  // Extract functional requirements
  const functionalReqs = [];
  for (const line of lines) {
    if (/^[-*•\d.]+\s+/.test(line.trim())) {
      const cleanLine = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (cleanLine.length > 5 && !constraintMatches.includes(cleanLine)) {
        functionalReqs.push(cleanLine);
      }
    }
  }
  if (functionalReqs.length === 0) {
    const actionVerbs = normalized.match(/\b(?:build|create|implement|design|provide|analyze|synthesize|compare|explain|generate|optimize)\b[^,.;\n]+/gi);
    if (actionVerbs) {
      actionVerbs.slice(0, 4).forEach((v) => functionalReqs.push(v.trim()));
    } else {
      functionalReqs.push(normalized.slice(0, 180));
    }
  }

  // Default role per task category
  const roleMap = {
    website_and_application_development: 'Lead Product Architect & Full-Stack Engineer',
    coding_and_debugging: 'Principal Software Engineer & Systems Architect',
    research_and_fact_finding: 'Senior Research Analyst & Scientific Fact-Checking Specialist',
    document_analysis_and_summarization: 'Information Architect & Forensic Document Analyst',
    writing_and_content_creation: 'Senior Technical Writer & Editorial Strategist',
    planning_and_problem_solving: 'Strategic Solutions Architect & Operations Director',
    learning_and_educational_assistance: 'Senior Pedagogical Instructor & Instructional Designer',
    data_analysis: 'Lead Data Scientist & Quantitative Analyst'
  };

  const role = roleMap[taskType] || 'Subject Matter Expert';

  return {
    task_type: taskType,
    objective: normalized.slice(0, 300),
    intended_audience: audience,
    role,
    background: 'User provided direct objective and specifications for execution.',
    functional_requirements: functionalReqs.slice(0, 6),
    technical_requirements: [
      'Adhere to modern clean architecture standards and maintainable modular conventions.',
      'Explicitly avoid deprecated dependencies or undocumented interfaces.'
    ],
    constraints: constraintMatches.slice(0, 5),
    must_have_requirements: functionalReqs.slice(0, 3).length ? functionalReqs.slice(0, 3) : [normalized.slice(0, 120)],
    expected_output: 'A comprehensive, structured, self-contained response satisfying all specified criteria without missing requirements.',
    quality_expectations: 'High precision, verified factuality, clean layout, actionable instructions, and zero speculative hallucinations.',
    success_criteria: [
      'Addresses 100% of the user objective and constraints.',
      'Delivers an immediately usable outcome tailored to the task type.'
    ],
    missing_information: [],
    ambiguities: [],
    assumptions: [
      'User intends to use this deliverable directly on their selected target platform.',
      'Any unspecified sub-parameters should follow industry best-practice standards.'
    ]
  };
}

export async function analyzeRequirementsWithGemini(originalRequest, userTaskType = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const systemPrompt = `You are the Requirement Analysis Module (Module 1) for Samskartha.
Analyze the user's input request and extract a structured requirement representation.
Do NOT execute the user's task. Deconstruct the requirements into clean JSON.

Supported task types:
- research_and_fact_finding
- coding_and_debugging
- website_and_application_development
- writing_and_content_creation
- document_analysis_and_summarization
- planning_and_problem_solving
- learning_and_educational_assistance
- data_analysis

Return ONLY valid JSON matching this exact schema:
{
  "task_type": "string",
  "objective": "string",
  "intended_audience": "string",
  "role": "string",
  "background": "string",
  "functional_requirements": ["string"],
  "technical_requirements": ["string"],
  "constraints": ["string"],
  "must_have_requirements": ["string"],
  "expected_output": "string",
  "quality_expectations": "string",
  "success_criteria": ["string"],
  "missing_information": ["string"],
  "ambiguities": ["string"],
  "assumptions": ["string"]
}`;

    const contents = `${systemPrompt}\n\nUSER REQUEST:\n${originalRequest}\n\nUSER SELECTED TASK TYPE: ${userTaskType || 'auto'}`;
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { temperature: 0.1, responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (error) {
    console.warn('[Module 1] Gemini analysis fallback:', error.message);
    return null;
  }
}

export async function analyzeRequirements(originalRequest, userTaskType = null) {
  const geminiResult = await analyzeRequirementsWithGemini(originalRequest, userTaskType);
  if (geminiResult && geminiResult.objective) {
    return geminiResult;
  }
  return analyzeRequirementsLocally(originalRequest, userTaskType);
}
