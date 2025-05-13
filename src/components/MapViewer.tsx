
import React, { useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import our new components
import MapContainer from './map/MapContainer';
import GeoTiffLayer from './map/GeoTiffLayer';
import MapControls from './map/MapControls';
import ExportControls from './map/ExportControls';
import LoadingOverlay from './map/LoadingOverlay';
import ShareButton from './map/ShareButton';

interface MapViewerProps {
  geoTiffData: ArrayBuffer | null;
  isProcessing: boolean;
}

const MapViewer: React.FC<MapViewerProps> = ({ geoTiffData, isProcessing }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  
  const handleMapReady = (mapInstance: L.Map) => {
    setMap(mapInstance);
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <LoadingOverlay isProcessing={isProcessing} />
      
      <MapControls />
      
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <ExportControls geoTiffData={geoTiffData} />
        <ShareButton />
      </div>
      
      <MapContainer onMapReady={handleMapReady}>
        <GeoTiffLayer map={map} geoTiffData={geoTiffData} />
      </MapContainer>
    </div>
  );
};

export default MapViewer;
