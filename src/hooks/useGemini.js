import { useState, useCallback } from 'react';
import { geminiComplete, geminiAnalyze, geminiTemplate, geminiChat, geminiStream, listGeminiModels, getWorkingModels } from '../utils/gemini';

/**
 * Custom React hook for Gemini API integration
 * Provides state management (loading, error) around the utility functions
 * 
 * @returns {Object} Hook with Gemini functions and state
 */
export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const complete = useCallback(async (prompt, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geminiComplete(prompt, options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyze = useCallback(async (text, analysisType = 'summary', options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geminiAnalyze(text, analysisType, options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const template = useCallback(async (templateStr, variables = {}, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geminiTemplate(templateStr, variables, options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback(async (messages, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geminiChat(messages, options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stream = useCallback(async (prompt, onChunk, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geminiStream(prompt, onChunk, options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listModels = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listGeminiModels(options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorking = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getWorkingModels(options);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    clearError,
    
    // Functions with state management
    complete,
    analyze,
    template,
    chat,
    stream,
    listModels,
    getWorking,
  };
}