export function compileLovable(ir) {
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
    `# Product & Implementation Specification (Lovable Build PRD)`,

    `## 1. Project Vision & Target Personas\n- Objective: ${objective}\n- Target Users: ${ir.audience || 'End users, team members, and system administrators'}\n- Product Persona: ${role || 'Lead Product Architect & Full-Stack Engineer'}\n- Core Value Proposition: Seamless, high-performance web experience with zero friction.`,

    `## 2. Navigation, Routing & Page Architecture\n- Architecture: Modern Single Page Application (SPA) with intuitive responsive navigation.\n- Layouts: Clean header with brand mark, mobile-responsive sidebar/drawer, and main workspace view.\n- Key Views / Routes:\n  * Home / Dashboard View\n  * Primary Workflow Interface\n  * Configuration / Details Modal or View`,

    `## 3. UI/UX Design System & Layouts\n- Styling: Clean modern interface using Tailwind CSS and Lucide icons.\n- Theme: High-contrast typography, subtle glassmorphic borders, accessible interactive states (hover, focus, disabled).\n- Feedback: Instant visual toasts, loading skeletons during async operations, and actionable empty states.`,

    `## 4. Core Features & Business Logic\n${requirements.length ? requirements.map((r, i) => `### Feature ${i + 1}: ${r}\n- Implement robust error handling and optimistic UI updates.\n- Validate all inputs on client and handle edge cases gracefully.`).join('\n\n') : '### Core Functionality\n- Implement end-to-end user journey matching the project objective.'}`,

    `## 5. Data Models & Schema Requirements\n- Frontend: React with TypeScript, Vite, Tailwind CSS, Lucide icons.\n- Data Schema:\n  * Primary Entity: UUID, createdAt, status, title, payload (JSONB).\n  * Relationships: Clean relational foreign keys where required.\n- Context Reference:\n${contextSummary || 'No external schema provided. Implement standard normalized relational schema.'}`,

    `## 6. Constraints, Guardrails & Acceptance Criteria\n${constraints.map((c) => `- [Constraint] ${c}`).join('\n')}\n${qualityCriteria.map((q) => `- [Acceptance Criterion] ${q}`).join('\n')}\n${profileRules.map((pr) => `- [Lovable Rule] ${pr.description}`).join('\n')}`,

    `## 7. Immutable Boundaries (What Should NOT Be Modified)\n${boundaries.length ? boundaries.map((b) => `- Do not modify or break: ${b}`).join('\n') : '- Do not alter existing core configuration files or break established routes.\n- Do not remove existing working unit tests or environment definitions.'}`
  ];

  return sections.join('\n\n');
}
