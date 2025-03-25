import { useState, useCallback } from 'react';
import { generateAIPortrait, AIPortraitParams, AIPortraitResult } from '@/services/aiService';

interface UseAIPortraitReturn {
  generatePortrait: (params: AIPortraitParams) => Promise<AIPortraitResult | null>;
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export default function useAIPortrait(): UseAIPortraitReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generatePortrait = useCallback(async (params: AIPortraitParams): Promise<AIPortraitResult | null> => {
    if (!params.photoDataUrl) {
      setError('No photo provided');
      return null;
    }

    try {
      setIsGenerating(true);
      setProgress(0);
      setError(null);

      // Call the AI service to generate the portrait
      const result = await generateAIPortrait(params, (percent) => {
        setProgress(percent);
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate portrait');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePortrait,
    isGenerating,
    progress,
    error
  };
} 