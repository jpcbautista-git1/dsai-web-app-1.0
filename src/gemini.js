/**
 * Gemini Integration - Easy Imports
 * 
 * Import everything you need from one place:
 * import { geminiComplete, useGemini } from './gemini';
 */

// Utility functions (direct usage with official SDK)
export { 
  geminiComplete, 
  geminiAnalyze, 
  geminiTemplate, 
  geminiChat,
  geminiStream,
  listGeminiModels,
  getWorkingModels
} from './utils/gemini';

// React hook (with state management)
export { useGemini } from './hooks/useGemini';

// Default export for convenience
export { geminiComplete as default } from './utils/gemini';