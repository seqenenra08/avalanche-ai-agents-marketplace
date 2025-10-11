import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-purple-500/30 border-t-purple-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-purple-300 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-shimmer rounded-lg ${className}`} />
  );
};

export const AgentCardSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <LoadingSkeleton className="h-48 w-full rounded-xl" />
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-4">
        <LoadingSkeleton className="h-10 w-full rounded-lg" />
        <LoadingSkeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-purple-200">{message}</p>
      </div>
    </div>
  );
};
