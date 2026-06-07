import { useCallback, useState } from 'react';
import {
  AgeGroup,
  deleteLesson,
  fetchLessons,
  generateLesson,
  getApiError,
  Lesson,
} from '../lib/api';

export interface UseLessonsResult {
  items: Lesson[];
  total: number;
  loading: boolean;
  generating: boolean;
  deletingId: string | null;
  error: string | null;
  load: (theme?: string) => Promise<void>;
  generate: (input: { ageGroup: AgeGroup; theme: string }) => Promise<Lesson | null>;
  remove: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export function useLessons(): UseLessonsResult {
  const [items, setItems] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (theme?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLessons(theme ? { theme } : undefined);
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = useCallback(
    async (input: { ageGroup: AgeGroup; theme: string }): Promise<Lesson | null> => {
      setGenerating(true);
      setError(null);
      try {
        const lesson = await generateLesson(input);
        return lesson;
      } catch (err) {
        setError(getApiError(err).message);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteLesson(id);
      setItems((prev) => prev.filter((l) => l.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      return true;
    } catch (err) {
      setError(getApiError(err).message);
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    items,
    total,
    loading,
    generating,
    deletingId,
    error,
    load,
    generate,
    remove,
    clearError,
  };
}
