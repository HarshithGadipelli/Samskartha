import { compilePromptWithAdapter } from './platformAdapters/index.js';
import { getTaskTemplate } from './profileRepository.js';
import { GoogleGenAI } from '@google/genai';

export async function buildIntermediateRepresentation({
  originalRequest,
  requirements,
  profile,
  retrievedContext,
  taskType
}) {
  const template = await getTaskTemplate(taskType || requirements.task_type);

  // Combine requirements and template guidance
  const combinedInstructions = [
    `Directly satisfy the core objective: ${requirements.objective}`,
    ...(template?.requiredSections?.map((sec) => `Include structured section: ${sec}`) || []),
    ...(requirements.functional_requirements || [])
  ];

  const boundaries = [
    'Preserve original user intent without hallucinating extra requirements.',
    'Do not contradict specified technical or operational constraints.',
    'Distinguish empirical facts from speculative assumptions.'
  ];

  const ir = {
    originalRequest,
    objective: requirements.objective,
    taskType: requirements.task_type,
    audience: requirements.intended_audience,
    role: requirements.role || template?.defaultRole || 'Specialist Architect',
    instructions: combinedInstructions.slice(0, 6),
    requirements: requirements.functional_requirements || [requirements.objective],
    technicalRequirements: requirements.technical_requirements || [],
    constraints: requirements.constraints || [],
    mustHaves: requirements.must_have_requirements || [],
    expectedOutput: requirements.expected_output,
    qualityCriteria: requirements.success_criteria || [requirements.quality_expectations],
    boundaries,
    contextSummary: retrievedContext?.compactSummary || 'No external context supplied.',
    profileRules: profile?.rules || [],
    platformId: profile.id,
    platformName: profile.name
  };

  return ir;
}

export async function compilePrompt({ ir, profile }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      
      const instructions = `You are the Prompt Compiler Engine for Samskartha.
Your task is to take the structured Intermediate Representation (IR) and compile it into a high-performance, platform-optimized prompt for ${profile.name}.
Follow the official guidelines of ${profile.name} strictly.
Preserve the user's requirements, constraints, and intent without altering them.
Do NOT execute the user's task. Output the optimized prompt that the user will paste into ${profile.name}.

Platform rules:
${JSON.stringify(profile.rules || [])}

Intermediate Representation:
${JSON.stringify(ir)}

Return ONLY valid JSON matching this schema:
{
  "optimizedPrompt": "string",
  "assumptions": ["string"],
  "notes": ["string"]
}`;

      const response = await ai.models.generateContent({
        model,
        contents: instructions,
        config: { temperature: 0.2, responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text.trim());
      if (parsed.optimizedPrompt && typeof parsed.optimizedPrompt === 'string') {
        return {
          optimizedPrompt: parsed.optimizedPrompt.trim(),
          assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          engine: 'gemini-compiled'
        };
      }
    } catch (err) {
      console.warn('[Prompt Compiler] Gemini generation fallback to deterministic adapter:', err.message);
    }
  }

  // Deterministic IR compilation via platform adapter
  const optimizedPrompt = compilePromptWithAdapter(profile.id, ir);
  return {
    optimizedPrompt,
    assumptions: [
      `Compiled using Samskartha's ${profile.name} deterministic adapter with verified rules.`,
      'Ready to be copied and pasted directly into the destination platform.'
    ],
    notes: [
      `Tailored to ${profile.name} formatting conventions (Profile v${profile.profileVersion || '2.0'}).`
    ],
    engine: 'deterministic-adapter'
  };
}
