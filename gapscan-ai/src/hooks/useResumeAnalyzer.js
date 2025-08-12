import { useState } from 'react';
import ResumeAnalyzerAPI from '../services/api';

export function useResumeAnalyzer() {
  const [api] = useState(() => new ResumeAnalyzerAPI());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeResume = async (pdfFile, jobDescription) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.analyzeResume(pdfFile, jobDescription);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractText = async (pdfFile) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.extractText(pdfFile);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeResume,
    extractText,
    loading,
    error,
    clearError: () => setError(null)
  };
}