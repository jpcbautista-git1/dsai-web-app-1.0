import React, { useState } from 'react';
import { useGemini } from '../hooks/useGemini';
import { geminiComplete, geminiStream, listGeminiModels, getWorkingModels } from '../utils/gemini'; // Can also import directly

/**
 * Example component showing how to use the Gemini functions
 */
export default function GeminiExample() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  
  // Using the hook (recommended for React components)
  const { loading, error, complete, analyze, clearError, listModels, getWorking } = useGemini();

  // Override console.log and console.warn to capture status messages
  React.useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      originalLog(...args);
      if (args[0]?.includes?.('✅ Successfully used model') || args[0]?.includes?.('⏳')) {
        setStatus(args.join(' '));
      }
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      if (args[0]?.includes?.('Model') || args[0]?.includes?.('Switching')) {
        setStatus(args.join(' '));
      }
    };
    
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
    };
  }, []);

  // Example 1: Basic text completion using the hook
  const handleComplete = async () => {
    if (!prompt.trim()) return;
    setStatus('Starting request...');
    setResult('');
    
    try {
      const response = await complete(prompt);
      setResult(response);
      setStatus('Request completed successfully!');
    } catch (err) {
      console.error('Completion failed:', err);
      setStatus('Request failed. Check console for details.');
    }
  };

  // Example 2: Text analysis
  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setStatus('Starting analysis...');
    setResult('');
    
    try {
      const summary = await analyze(prompt, 'summary');
      setResult(summary);
      setStatus('Analysis completed successfully!');
    } catch (err) {
      console.error('Analysis failed:', err);
      setStatus('Analysis failed. Check console for details.');
    }
  };

  // Example 3: Direct function call (without hook state management)
  const handleDirectCall = async () => {
    if (!prompt.trim()) return;
    setStatus('Making direct API call...');
    setResult('');
    
    try {
      const response = await geminiComplete(prompt, {
        temperature: 0.5,
        maxOutputTokens: 200
      });
      setResult(response);
      setStatus('Direct call completed successfully!');
    } catch (err) {
      console.error('Direct call failed:', err);
      setResult(`Error: ${err.message}`);
      setStatus('Direct call failed. Check console for details.');
    }
  };

  // Example 4: Streaming response (real-time text generation)
  const handleStream = async () => {
    if (!prompt.trim()) return;
    setStatus('Starting streaming response...');
    setResult('');
    
    try {
      let streamedText = '';
      await geminiStream(
        prompt, 
        (chunk) => {
          streamedText += chunk;
          setResult(streamedText);
        },
        {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      );
      setStatus('Streaming completed successfully!');
    } catch (err) {
      console.error('Streaming failed:', err);
      setResult(`Error: ${err.message}`);
      setStatus('Streaming failed. Check console for details.');
    }
  };

  // Example 5: List available models
  const handleListModels = async () => {
    setStatus('Fetching available models...');
    
    try {
      const models = await listModels();
      setAvailableModels(models);
      setResult(`Available Gemini models:\n\n${models.map((model, i) => `${i + 1}. ${model}`).join('\n')}`);
      setStatus(`Found ${models.length} available models!`);
    } catch (err) {
      console.error('Failed to list models:', err);
      setResult(`Error: ${err.message}`);
      setStatus('Failed to list models. Check console for details.');
    }
  };

  // Example 5b: Get working models in priority order
  const handleGetWorkingModels = async () => {
    setStatus('Fetching working models in priority order...');
    
    try {
      const models = await getWorkingModels();
      setResult(`Working Models (Priority Order):\n\n${models.map((model, i) => `${i + 1}. ${model} ${i === 0 ? '⭐ (Recommended)' : ''}`).join('\n')}\n\nNote: These models are ordered by reliability and performance.`);
      setStatus(`Found ${models.length} working models!`);
    } catch (err) {
      console.error('Failed to get working models:', err);
      setResult(`Error: ${err.message}`);
      setStatus('Failed to get working models. Check console for details.');
    }
  };

  // Example 6: Auto-detect and use first available model
  const handleAutoComplete = async () => {
    if (!prompt.trim()) return;
    setStatus('Auto-detecting working models and completing...');
    setResult('');
    
    try {
      // First get working models in priority order
      const models = await getWorkingModels();
      if (models.length === 0) {
        throw new Error('No working models available');
      }
      
      // Use the first working model (highest priority)
      const firstModel = models[0];
      console.log(`🎯 Auto-using best available model: ${firstModel}`);
      setStatus(`Using model: ${firstModel}`);
      
      const response = await geminiComplete(prompt, {
        models: [firstModel], // Use only the best available model
        temperature: 0.3,
        maxOutputTokens: 500
      });
      
      setResult(response);
      setStatus(`✅ Successfully used auto-detected model: ${firstModel}`);
    } catch (err) {
      console.error('Auto-complete failed:', err);
      setResult(`Error: ${err.message}`);
      setStatus('Auto-complete failed. Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Gemini AI Integration Example</h2>
      <p>Now with <strong>correct model names</strong> and model listing functionality!</p>
      <p>Models used: gemini-1.5-flash-8b-exp-0924, gemini-1.5-flash-exp-0827, gemini-1.5-pro-exp-0827, gemini-1.0-pro</p>
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#fee', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Error: {error}</span>
          <button onClick={clearError} style={{ padding: '4px 8px' }}>
            ✕
          </button>
        </div>
      )}

      {/* Status Display */}
      {status && (
        <div style={{ 
          backgroundColor: loading ? '#fff3cd' : '#d4edda',
          color: loading ? '#856404' : '#155724',
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px',
          border: `1px solid ${loading ? '#ffeaa7' : '#c3e6cb'}`,
          fontSize: '14px'
        }}>
          {loading && '🔄 '}{status}
        </div>
      )}

      {/* Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Enter your prompt:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your question or text here..."
          style={{ 
            width: '100%', 
            minHeight: '100px', 
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleComplete}
          disabled={loading || !prompt.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Complete Text'}
        </button>

        <button 
          onClick={handleAnalyze}
          disabled={loading || !prompt.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#28a745', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Summarize'}
        </button>

        <button 
          onClick={handleDirectCall}
          disabled={!prompt.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Direct Call
        </button>

        <button 
          onClick={handleStream}
          disabled={!prompt.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ff6b6b', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚀 Stream Response
        </button>

        <button 
          onClick={handleListModels}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#9c88ff', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 List Available Models
        </button>

        <button 
          onClick={handleGetWorkingModels}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6f42c1', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🎯 Get Working Models
        </button>

        <button 
          onClick={handleAutoComplete}
          disabled={loading || !prompt.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#20c997', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing...' : '🎯 Auto-Complete (Safe)'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div>
          <h3>Result:</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '15px',
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {result}
          </div>
        </div>
      )}

      {/* Usage Examples */}
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <h4>🚀 Now using Official Google GenAI SDK with gemini-3.0-flash-preview!</h4>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`// Method 1: Using the hook (with loading states)
import { useGemini } from '../hooks/useGemini';

function MyComponent() {
  const { loading, error, complete, stream } = useGemini();
  
  const handleSubmit = async () => {
    const result = await complete("Your prompt here");
  };
}

// Method 2: Direct function import (with fallback models)
import { geminiComplete, geminiStream } from '../utils/gemini';

const result = await geminiComplete("Your prompt", {
  models: ['gemini-3.0-flash-preview', 'gemini-1.5-flash'], 
  temperature: 0.3,
  maxOutputTokens: 500
});

// Method 3: Streaming response
import { geminiStream } from '../utils/gemini';

await geminiStream("Your prompt", (chunk) => {
  console.log('New chunk:', chunk);
}, { model: 'gemini-3.0-flash-preview' });`}
        </pre>
      </div>
    </div>
  );
}