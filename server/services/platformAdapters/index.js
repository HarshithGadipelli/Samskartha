import { compileChatGPT } from './chatgptAdapter.js';
import { compileClaude } from './claudeAdapter.js';
import { compileGemini } from './geminiAdapter.js';
import { compilePerplexity } from './perplexityAdapter.js';
import { compileLovable } from './lovableAdapter.js';
import { compileNotebookLM } from './notebooklmAdapter.js';

const adapters = {
  chatgpt: compileChatGPT,
  claude: compileClaude,
  gemini: compileGemini,
  perplexity: compilePerplexity,
  lovable: compileLovable,
  notebooklm: compileNotebookLM
};

export function compilePromptWithAdapter(platformId, ir) {
  const adapter = adapters[platformId?.toLowerCase()] || adapters.chatgpt;
  return adapter(ir);
}

export function getSupportedPlatformIds() {
  return Object.keys(adapters);
}
