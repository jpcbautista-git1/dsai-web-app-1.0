# Gemini AI Integration - Official SDK & Latest Models

A professional, reusable solution using the **official Google Generative AI SDK** with **gemini-3.0-flash-preview** model.

## 🚀 **New Features:**

- ✅ **Official Google SDK** (@google/generative-ai)
- ✅ **gemini-3.0-flash-preview** model (latest and fastest)
- ✅ **Real-time streaming** responses
- ✅ **Automatic fallback** to stable models
- ✅ **Better error handling** and safety settings
- ✅ **Professional retry logic** with exponential backoff

## 📁 **Files Created:**

- `src/utils/gemini.js` - Core utility functions using official SDK
- `src/hooks/useGemini.js` - React hook with state management  
- `src/gemini.js` - Easy import barrel file
- `src/components/GeminiExample.jsx` - Usage examples with streaming

## 🚀 **Quick Usage:**

### **Option 1: Import individual functions**
```javascript
import { geminiComplete, geminiStream } from './gemini';

// Simple text completion with latest model
const result = await geminiComplete("Explain React hooks");

// Streaming response (real-time text generation)
await geminiStream("Write a story", (chunk) => {
  console.log('New text:', chunk);
});
```

### **Option 2: Use React hook (recommended for components)**
```javascript
import { useGemini } from './gemini';

function MyComponent() {
  const { loading, error, complete, stream } = useGemini();
  
  const handleSubmit = async () => {
    try {
      // Uses gemini-3.0-flash-preview by default
      const result = await complete("Your prompt here");
      console.log(result);
    } catch (err) {
      console.log('Error state:', error);
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
}
```

## 🔧 **Available Functions:**

### **Core Functions:**
- `geminiComplete(prompt, options)` - Basic text completion with latest models
- `geminiAnalyze(text, type, options)` - Text analysis (summary, sentiment, keywords)
- `geminiTemplate(template, variables, options)` - Template-based generation
- `geminiChat(messages, options)` - Chat with conversation history
- `geminiStream(prompt, onChunk, options)` - **NEW!** Real-time streaming responses

### **Hook Functions:**
- `useGemini()` - Returns `{ loading, error, complete, analyze, template, chat, stream, clearError }`

## ⚙️ **Options:**

```javascript
const options = {
  // Model configuration (uses official SDK models)
  models: ['gemini-3.0-flash-preview', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  
  // Generation settings
  temperature: 0.2,                   // Creativity (0-1)
  maxOutputTokens: 800,               // Response length
  topP: 0.95,                         // Nucleus sampling
  topK: 40,                           // Top-k sampling
  
  // Retry and fallback
  maxRetries: 2,                      // Retries per model
  retryDelay: 1000,                   // Delay between retries
  
  // Safety settings (uses SDK safety categories)
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    }
  ]
};

await geminiComplete("Your prompt", options);
```

## 📋 **Usage Examples:**

### **1. Basic Text Completion**
```javascript
const result = await geminiComplete(
  "Write a brief explanation of machine learning",
  { temperature: 0.3, maxTokens: 200 }
);
```

### **2. Text Analysis**
```javascript
// Summarize text
const summary = await geminiAnalyze(longText, "summary");

// Check sentiment  
const sentiment = await geminiAnalyze(review, "sentiment");

// Extract keywords
const keywords = await geminiAnalyze(article, "keywords");

// Translate text
const translation = await geminiAnalyze(text, "translate", { language: "Spanish" });
```

### **3. Template Generation**
```javascript
const template = `
Write a {{type}} about {{topic}}.
Make it {{tone}} and around {{length}} words.
`;

const result = await geminiTemplate(template, {
  type: "blog post",
  topic: "React development", 
  tone: "professional",
  length: "500"
});
```

### **4. Chat Conversation**
```javascript
const messages = [
  { role: 'user', content: 'Hello, how are you?' },
  { role: 'assistant', content: 'I am doing well, thank you!' },
  { role: 'user', content: 'Can you help me with React?' }
];

const response = await geminiChat(messages);
```

## 🛠 **Setup:**

1. **Set environment variables:**
   ```bash
   # Create .env file (already created for you!)
  VITE_GEMINI_API_KEY=your_api_key_here
  VITE_GOOGLE_API_KEY=your_api_key_here
   ```

2. **Start your React app:**
   ```bash
   npm run dev
   ```

3. **Test the integration:**
   Visit `http://localhost:5173/gemini` to see the example in action.

**Note:** No proxy server needed! The integration now connects directly to Google's Gemini API.

## 🎯 **Use Anywhere:**

You can now import and use these functions in any component:

```javascript
// In any component file
import { geminiComplete, useGemini } from '../gemini';

// Direct usage
const handleAnalyzeProject = async (projectData) => {
  const analysis = await geminiComplete(
    `Analyze this project: ${JSON.stringify(projectData)}`
  );
  return analysis;
};

// Or with React hook
function ProjectAnalyzer() {
  const { loading, complete } = useGemini();
  // ... use complete() function
}
```

## 🔍 **Error Handling:**

The functions automatically handle errors and provide meaningful messages:
- Network errors
- API authentication issues  
- Invalid responses
- Rate limiting

When using the hook, errors are automatically stored in the `error` state.

That's it! You now have a simple, reusable Gemini integration that works throughout your project.