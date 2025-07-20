
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface OptimizedLoadingProps {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  fallbackMessage?: string;
  showSkeletons?: boolean;
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({
  isLoading,
  error,
  onRetry,
  children,
  fallbackMessage = "Carregando...",
  showSkeletons = false
}) => {
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    if (showSkeletons) {
      return (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 text-center">{fallbackMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Skeleton específico para listas
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton para cards
export const CardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);
