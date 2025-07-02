// components/LoaderOverlay.tsx
import React from 'react';

interface LoaderOverlayProps {
  isLoading: boolean;
  message?: string;
}

import { Spinner } from './Spinner';

export const LoaderOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
        <Spinner size={64} thickness={6} />
        <div className="text-gray-800 font-medium">Chargement en cours…</div>
      </div>
    </div>
  );
};
