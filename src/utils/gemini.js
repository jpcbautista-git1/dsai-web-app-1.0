/**
 * Gemini API Integration Utility
 * 
 * Uses official Google Generative AI SDK (@google/generative-ai)
 * Features:
 * - Official SDK with better error handling
 * - Automatic retry logic with exponential backoff
 * - Fallback to multiple models including gemini-3.0-flash-preview
 * - Better streaming support and safety settings
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize Gemini AI with API key
 * @param {string} apiKey - Gemini API key
 * @returns {GoogleGenerativeAI} - Initialized GenAI instance
 */
function initializeGenAI(apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set VITE_GEMINI_API_KEY or VITE_GOOGLE_API_KEY in your .env file');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * List available Gemini models
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} - Array of available model names
 */
export async function listGeminiModels(options = {}) {
  const {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY
  } = options;

  try {
    console.log('📋 Fetching available models via REST API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // Filter for models that support generateContent
    const generateContentModels = models.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    );
    
    const modelNames = generateContentModels.map(model => model.name.replace('models/', ''));
    console.log('📋 Available Gemini models:', modelNames);
    return modelNames;
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    throw error;
  }
}

/**
 * Get reliable fallback models by checking what's actually available
 * @param {Object} options - Configuration options  
 * @returns {Promise<Array>} - Array of working model names
 */
export async function getWorkingModels(options = {}) {
  try {
    const availableModels = await listGeminiModels(options);
    
    // Prioritize models we know work well (verified available models)
    const preferredOrder = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-pro-latest',
      'gemini-2.0-flash',
      'gemini-2.0-flash-001',
      'gemini-3-flash-preview',
      'gemini-3.1-pro-preview'
    ];
    
    // Return available models in preferred order
    const workingModels = preferredOrder.filter(model => 
      availableModels.includes(model)
    );
    
    // Add any other available models not in our preferred list
    const otherModels = availableModels.filter(model => 
      !preferredOrder.includes(model)
    );
    
    const result = [...workingModels, ...otherModels];
    console.log('🎯 Working models (in priority order):', result);
    return result;
    
  } catch (error) {
    console.warn('⚠️  Could not fetch available models, using fallback list');
    // Return verified working models as fallback
    return ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-pro-latest', 'gemini-2.0-flash'];
  }
}

/**
 * Complete text using Gemini AI with official SDK
 * @param {string} prompt - The text prompt for completion
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - The completed text
 */
export async function geminiComplete(prompt, options = {}) {
  const {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY,
    models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-pro-latest', 'gemini-2.0-flash'],
    temperature = 0.2,
    maxOutputTokens = 800,
    topP = 0.95,
    topK = 40,
    maxRetries = 2,
    retryDelay = 1000,
    safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
    ...otherOptions
  } = options;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt is required and must be a non-empty string');
  }

  const genAI = initializeGenAI(apiKey);

  // Try each model with retry logic
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const currentModelName = models[modelIndex];
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Trying model: ${currentModelName} (attempt ${attempt + 1}/${maxRetries + 1})`);
        
        const model = genAI.getGenerativeModel({ 
          model: currentModelName,
          generationConfig: {
            temperature,
            maxOutputTokens,
            topP,
            topK,
            ...otherOptions
          },
          safetySettings
        });

        const result = await model.generateContent(prompt.trim());
        const response = await result.response;
        const text = response.text();

        if (text && text.trim()) {
          console.log(`✅ Successfully used model: ${currentModelName} (attempt ${attempt + 1})`);
          return text.trim();
        } else {
          throw new Error('Empty response generated');
        }

      } catch (error) {
        console.error(`❌ Model ${currentModelName} attempt ${attempt + 1} failed:`, error.message);
        
        // Check if it's a rate limit or high demand error
        const isRateLimited = error.message.includes('rate') || 
                             error.message.includes('quota') || 
                             error.message.includes('high demand') ||
                             error.message.includes('503') ||
                             error.status === 503;

        // If this is the last attempt with the last model, throw the error
        if (attempt === maxRetries && modelIndex === models.length - 1) {
          console.error('❌ All models and retries exhausted');
          throw new Error(`All Gemini models failed. Last error: ${error.message}`);
        }
        
        // If it's a rate limit error, continue to next attempt/model
        if (isRateLimited) {
          if (attempt < maxRetries) {
            const delay = retryDelay * (attempt + 1);
            console.log(`⏳ Retrying in ${delay}ms due to rate limiting...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Try next model
            console.warn(`🔄 Switching to fallback model: ${models[modelIndex + 1] || 'none available'}`);
            break;
          }
        }
        
        // For safety blocks or other errors, try next model immediately
        if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
          console.warn(`🛡️  Content blocked by safety filters, trying next model...`);
          break;
        }
        
        // For other errors, try next model
        break;
      }
    }
  }

  throw new Error('All Gemini models are currently unavailable. Please try again later.');
}

/**
 * Analyze text using Gemini AI
 * @param {string} text - Text to analyze
 * @param {string} analysisType - Type of analysis ('summary', 'sentiment', 'keywords', etc.)
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Analysis result
 */
export async function geminiAnalyze(text, analysisType = 'summary', options = {}) {
  let prompt = '';
  
  switch (analysisType.toLowerCase()) {
    case 'summary':
      prompt = `Please provide a concise summary of the following text:\n\n${text}`;
      break;
    case 'sentiment':
      prompt = `Analyze the sentiment of the following text (positive/negative/neutral) and explain why:\n\n${text}`;
      break;
    case 'keywords':
      prompt = `Extract the main keywords and key phrases from the following text:\n\n${text}`;
      break;
    case 'translate':
      const targetLanguage = options.language || 'English';
      prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;
      break;
    default:
      prompt = `Analyze the following text for ${analysisType}:\n\n${text}`;
  }

  return geminiComplete(prompt, options);
}

/**
 * Generate content using a template with variables
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} variables - Variables to replace in template
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Generated content
 */
export async function geminiTemplate(template, variables = {}, options = {}) {
  let processedTemplate = template;
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    processedTemplate = processedTemplate.replace(regex, String(value));
  });

  return geminiComplete(processedTemplate, options);
}

/**
 * Chat with Gemini using conversation history with official SDK
 * @param {Array} messages - Array of {role: 'user'|'model'|'assistant', content: string} objects
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Response from Gemini
 */
export async function geminiChat(messages, options = {}) {
  const {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY,
    models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-pro-latest', 'gemini-2.0-flash'],
    temperature = 0.2,
    maxOutputTokens = 800,
    topP = 0.95,
    topK = 40,
    maxRetries = 2,
    retryDelay = 1000,
    safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
    ...otherOptions
  } = options;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and must not be empty');
  }

  const genAI = initializeGenAI(apiKey);

  // Try each model with retry logic
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const currentModelName = models[modelIndex];
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Trying chat model: ${currentModelName} (attempt ${attempt + 1}/${maxRetries + 1})`);
        
        const model = genAI.getGenerativeModel({ 
          model: currentModelName,
          generationConfig: {
            temperature,
            maxOutputTokens,
            topP,
            topK,
            ...otherOptions
          },
          safetySettings
        });

        // Convert messages to SDK format
        const history = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1];
        
        // Start chat session with history
        const chat = model.startChat({
          history: history
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim()) {
          console.log(`✅ Successfully used chat model: ${currentModelName} (attempt ${attempt + 1})`);
          return text.trim();
        } else {
          throw new Error('Empty response generated');
        }

      } catch (error) {
        console.error(`❌ Chat model ${currentModelName} attempt ${attempt + 1} failed:`, error.message);
        
        // Check if it's a rate limit or high demand error
        const isRateLimited = error.message.includes('rate') || 
                             error.message.includes('quota') || 
                             error.message.includes('high demand') ||
                             error.message.includes('503') ||
                             error.status === 503;

        // If this is the last attempt with the last model, throw the error
        if (attempt === maxRetries && modelIndex === models.length - 1) {
          console.error('❌ All chat models and retries exhausted');
          throw new Error(`All Gemini chat models failed. Last error: ${error.message}`);
        }
        
        // If it's a rate limit error, continue to next attempt/model
        if (isRateLimited) {
          if (attempt < maxRetries) {
            const delay = retryDelay * (attempt + 1);
            console.log(`⏳ Retrying chat in ${delay}ms due to rate limiting...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Try next model
            console.warn(`🔄 Switching to fallback chat model: ${models[modelIndex + 1] || 'none available'}`);
            break;
          }
        }
        
        // For safety blocks or other errors, try next model immediately
        if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
          console.warn(`🛡️  Chat content blocked by safety filters, trying next model...`);
          break;
        }
        
        // For other errors, try next model
        break;
      }
    }
  }

  throw new Error('All Gemini chat models are currently unavailable. Please try again later.');
}

/**
 * Stream text completion from Gemini (using official SDK streaming)
 * @param {string} prompt - The text prompt for completion
 * @param {Function} onChunk - Callback for each text chunk
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Complete generated text
 */
export async function geminiStream(prompt, onChunk, options = {}) {
  const {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY,
    models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-pro-latest', 'gemini-2.0-flash'],
    temperature = 0.2,
    maxOutputTokens = 800,
    topP = 0.95,
    topK = 40,
    safetySettings = [],
    maxRetries = 2,
    retryDelay = 1000,
    ...otherOptions
  } = options;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt is required and must be a non-empty string');
  }

  const genAI = initializeGenAI(apiKey);
  
  // Try each model with retry logic
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const currentModelName = models[modelIndex];
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🎵 Streaming with model: ${currentModelName} (attempt ${attempt + 1})`);
        
        const geminiModel = genAI.getGenerativeModel({ 
          model: currentModelName,
          generationConfig: {
            temperature,
            maxOutputTokens,
            topP,
            topK,
            ...otherOptions
          },
          safetySettings
        });

        const result = await geminiModel.generateContentStream(prompt.trim());
        let fullText = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          if (onChunk && typeof onChunk === 'function') {
            onChunk(chunkText);
          }
        }

        console.log(`✅ Successfully streamed with model: ${currentModelName}`);
        return fullText;

      } catch (error) {
        console.error(`❌ Stream error with ${currentModelName}:`, error.message);
        
        // Check if it's a rate limiting error (503 status)
        const isRateLimited = error.message.includes('503') || 
                             error.message.includes('high demand') ||
                             error.message.includes('rate limit');
        
        // If this is the last model and last retry, throw the error
        if (attempt === maxRetries && modelIndex === models.length - 1) {
          console.error('❌ All stream models and retries exhausted');
          throw new Error(`All Gemini stream models failed. Last error: ${error.message}`);
        }
        
        // If it's a rate limit error, continue to next attempt/model
        if (isRateLimited) {
          if (attempt < maxRetries) {
            const delay = retryDelay * (attempt + 1);
            console.log(`⏳ Retrying stream in ${delay}ms due to rate limiting...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Try next model
            console.warn(`🔄 Switching to fallback stream model: ${models[modelIndex + 1] || 'none available'}`);
            break;
          }
        }
        
        // For safety blocks or other errors, try next model immediately
        if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
          console.warn(`🛡️  Stream content blocked by safety filters, trying next model...`);
          break;
        }
        
        // For other errors, try next model
        break;
      }
    }
  }

  throw new Error('All Gemini stream models are currently unavailable. Please try again later.');
}