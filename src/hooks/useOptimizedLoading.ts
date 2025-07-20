
import { useState, useCallback, useRef } from 'react';

interface UseOptimizedLoadingProps {
  initialLoading?: boolean;
  minLoadingTime?: number;
  maxRetries?: number;
}

export const useOptimizedLoading = ({
  initialLoading = false,
  minLoadingTime = 500,
  maxRetries = 3
}: UseOptimizedLoadingProps = {}) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const loadingStartTime = useRef<number | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
    loadingStartTime.current = Date.now();
  }, []);

  const stopLoading = useCallback(async () => {
    if (loadingStartTime.current) {
      const elapsed = Date.now() - loadingStartTime.current;
      if (elapsed < minLoadingTime) {
        // Garante tempo mínimo de loading para melhor UX
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
    }
    setLoading(false);
    loadingStartTime.current = null;
  }, [minLoadingTime]);

  const setErrorState = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
    loadingStartTime.current = null;
  }, []);

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      setErrorState('Número máximo de tentativas excedido');
      return;
    }

    try {
      setRetryCount(prev => prev + 1);
      startLoading();
      await operation();
      setRetryCount(0); // Reset on success
      await stopLoading();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorState(errorMessage);
    }
  }, [retryCount, maxRetries, startLoading, stopLoading, setErrorState]);

  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      startLoading();
      const result = await operation();
      await stopLoading();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorState(errorMessage);
      return null;
    }
  }, [startLoading, stopLoading, setErrorState]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
    loadingStartTime.current = null;
  }, []);

  return {
    loading,
    error,
    retryCount,
    canRetry: retryCount < maxRetries,
    startLoading,
    stopLoading,
    setError: setErrorState,
    retry,
    executeWithLoading,
    reset
  };
};
