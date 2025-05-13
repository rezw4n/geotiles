
import React from 'react';

interface LoadingOverlayProps {
  isProcessing: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
      <div className="flex flex-col items-center">
        <div className="pulsing-dot animate-pulse-slow mb-3"></div>
        <p className="text-sm font-medium text-map-dark-blue">Processing GeoTIFF...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
