
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { initializeProj4 } from '@/utils/proj4Utils';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
  children?: React.ReactNode;
  onMapReady: (map: L.Map) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ children, onMapReady }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize proj4 first
    initializeProj4();

    // Create map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [0, 0],
        zoom: 2,
        attributionControl: true,
      });

      // Add base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      
      // Call the onMapReady callback with the map instance
      onMapReady(mapRef.current);
    }

    return () => {
      // Clean up when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapReady]);

  return (
    <div ref={mapContainerRef} className="h-full w-full">
      {children}
    </div>
  );
};

export default MapContainer;
