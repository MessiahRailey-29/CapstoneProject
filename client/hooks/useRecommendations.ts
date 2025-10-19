// client/hooks/useRecommendations.ts
import { useState, useEffect, useCallback } from 'react';
import { recommendationsApi, Recommendation } from '@/services/recommendationsApi';

export function useRecommendations(userId: string | null, limit: number = 10) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await recommendationsApi.getRecommendations(userId, limit);
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
  };
}