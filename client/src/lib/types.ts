export type PlatformRule = {
  ruleId: string;
  platformId?: string;
  title: string;
  description: string;
  applicableTasks?: string[];
  sourceUrl?: string;
  sourceTitle?: string;
  lastVerified?: string;
  verificationStatus?: string;
};

export type Platform = {
  id: string;
  name: string;
  url: string;
  promptStyle?: string;
  ruleCount?: number;
  rules?: PlatformRule[];
  lastVerified?: string;
  profileVersion?: string;
};

export type TaskTemplate = {
  id: string;
  name: string;
  description: string;
  defaultRole?: string;
  requiredSections?: string[];
  outputFormats?: string[];
};

export type RequirementRepresentation = {
  task_type: string;
  objective: string;
  intended_audience: string;
  role: string;
  background?: string;
  functional_requirements: string[];
  technical_requirements: string[];
  constraints: string[];
  must_have_requirements: string[];
  expected_output: string;
  quality_expectations: string;
  success_criteria: string[];
  missing_information: string[];
  ambiguities: string[];
  assumptions: string[];
};

export type QualityCheck = {
  score: number;
  passed: boolean;
  preservesIntent: boolean;
  coversConstraints: boolean;
  checks: { id: string; name: string; passed: boolean; details: string }[];
  notes: string[];
};

export type PackageResult = {
  id: string;
  createdAt: string;
  platform: {
    id: string;
    name: string;
    url: string;
    profileVersion?: string;
    lastVerified?: string;
    rules?: PlatformRule[];
  };
  mode: 'gemini' | 'demo';
  requirements: RequirementRepresentation;
  optimizedPrompt: string;
  contextSummary: string;
  detailedContext: string;
  references: { title: string; url: string; whyRelevant?: string; platformId?: string }[];
  assumptions: string[];
  qualityCheck: QualityCheck;
  retrieval: {
    method: string;
    retrievedItems: number;
    uploadedFileCount: number;
    chunkCount: number;
  };
  exportFormats: {
    markdown: string;
    plainText: string;
  };
  metrics?: {
    promptTokensEst: number;
    contextTokensEst: number;
    totalPackageTokensEst: number;
    rawInputTokensEst: number;
    compressionRatioPercent: string;
  };
};

export type BenchmarkCase = {
  id: string;
  taskType: string;
  title: string;
  request: string;
  expectedSections: string[];
};
