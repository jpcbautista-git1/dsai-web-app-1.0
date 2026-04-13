# Gemini AI Integration

This project includes a comprehensive integration with Google's Gemini AI using the official `@google/generative-ai` SDK.

## 🔑 Setup

1. **Install Dependencies**
```bash
npm install @google/generative-ai
```

2. **Configure API Key**
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📁 File Structure

```
src/
├── gemini.js                  # Barrel export file
├── utils/gemini.js           # Core utility functions
├── hooks/useGemini.js        # React hook wrapper
└── components/GeminiExample.jsx # Demo component
```

## 🛠️ Core Functions

### Text Completion
```javascript
import { geminiComplete } from './src/gemini';

const response = await geminiComplete('Write a haiku about coding');
```

### Chat Conversation
```javascript
import { geminiChat } from './src/gemini';

const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'model', content: 'Hi there!' },
  { role: 'user', content: 'Tell me about AI' }
];

const response = await geminiChat(messages);
```

### Streaming Responses
```javascript
import { geminiStream } from './src/gemini';

const stream = geminiStream('Explain quantum computing', {
  onChunk: (chunk) => console.log('Received:', chunk),
  onComplete: (fullText) => console.log('Complete:', fullText),
  onError: (error) => console.error('Error:', error)
});
```

### Model Management
```javascript
import { listGeminiModels, getWorkingModels } from './src/gemini';

// List all available models
const allModels = await listGeminiModels();

// Get working models in priority order (recommended)
const workingModels = await getWorkingModels();
```

### Text Analysis
```javascript
import { geminiAnalyze } from './src/gemini';

const summary = await geminiAnalyze(text, 'summary');
const sentiment = await geminiAnalyze(text, 'sentiment');
const keywords = await geminiAnalyze(text, 'keywords');
```

### Template Generation
```javascript
import { geminiTemplate } from './src/gemini';

const template = "Write a {{type}} about {{topic}} in {{style}} style";
const variables = { type: 'poem', topic: 'nature', style: 'romantic' };

const result = await geminiTemplate(template, variables);
```

## ⚛️ React Hook Usage

```javascript
import { useGemini } from './src/gemini';

function MyComponent() {
  const { 
    loading, 
    error, 
    complete, 
    analyze, 
    chat,
    stream,
    listModels,
    getWorking,
    clearError 
  } = useGemini();

  const handleClick = async () => {
    try {
      const response = await complete('Hello AI');
      console.log(response);
    } catch (err) {
      console.error('AI Error:', err);
    }
  };

  return (
    <div>
      {loading && <p>Processing...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleClick}>Ask AI</button>
    </div>
  );
}
```

## 🎯 Model Priority & Fallbacks

The integration includes intelligent model selection:

1. **Preferred Models** (in priority order):
   - `gemini-1.5-flash-8b-exp-0924` ⭐ (Fastest, most reliable)
   - `gemini-1.5-flash-exp-0827` 
   - `gemini-1.5-pro-exp-0827`
   - `gemini-1.0-pro`

2. **Automatic Fallbacks**: If a model fails, automatically tries the next one
3. **Smart Model Detection**: `getWorkingModels()` checks what's actually available
4. **Retry Logic**: Built-in exponential backoff for temporary failures

## 🔧 Configuration Options

All functions accept an options object:

```javascript
const options = {
  apiKey: 'custom-key',                    // Override default API key
  models: ['custom-model'],               // Override model list
  temperature: 0.7,                       // Creativity (0-1)
  maxOutputTokens: 1000,                 // Response length
  topP: 0.8,                             // Nucleus sampling
  topK: 40,                              // Top-k sampling
  maxRetries: 3,                         // Retry attempts
  retryDelay: 1000,                      // Delay between retries (ms)
  safetySettings: [...]                  // Content safety filters
};

const response = await geminiComplete(prompt, options);
```

## 🚨 Error Handling

The integration handles common errors automatically:

- **503 High Demand**: Automatic retries with exponential backoff
- **404 Model Not Found**: Falls back to next available model
- **Rate Limiting**: Waits and retries
- **Safety Blocks**: Tries alternative models
- **Network Issues**: Retry logic with delays

## 🧪 Testing

Visit `/` in your browser to access the interactive demo component with:

- ✅ Text completion examples
- ✅ Sentiment analysis
- ✅ Template generation
- ✅ Streaming responses
- ✅ Model listing and selection
- ✅ Auto-complete with best model detection

## 📝 Recent Updates

### Fixed Model Compatibility (Latest Update)
- ✅ **Fixed 404 Errors**: Updated model names to working versions
- ✅ **Added Model Discovery**: New `getWorkingModels()` function
- ✅ **Smart Auto-Complete**: Automatically uses best available model
- ✅ **Priority Ordering**: Models ranked by reliability and performance

### Previous Updates
- ✅ Migrated to official `@google/generative-ai` SDK
- ✅ Added streaming support with real-time updates
- ✅ Implemented comprehensive error handling and retries
- ✅ Created React hook wrapper with state management
- ✅ Added model listing and availability checking

## 🔗 Integration Points

The Gemini integration is ready to use in any part of your React app:

```javascript
// Direct import (for utility functions)
import { geminiComplete } from './src/gemini';

// React hook (for components with state management)
import { useGemini } from './src/gemini';

// Custom configurations
import { geminiChat } from './src/utils/gemini';
```

---

**Note**: Make sure your API key has access to the Gemini models. Some experimental models may require special access or have regional availability restrictions.