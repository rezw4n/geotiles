
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapIcon } from 'lucide-react';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <MapIcon className="w-6 h-6 text-map-blue" />
        <h1 className="text-xl font-semibold text-map-dark-blue">GeoTIFF Visualizer</h1>
      </div>
      
      {!isMobile && (
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-sm font-medium text-map-dark-grey hover:text-map-blue transition-colors">Home</a>
          <a href="#" className="text-sm font-medium text-map-dark-grey hover:text-map-blue transition-colors">About</a>
          <a href="#" className="text-sm font-medium text-map-dark-grey hover:text-map-blue transition-colors">Documentation</a>
        </nav>
      )}
    </header>
  );
};

export default Header;
