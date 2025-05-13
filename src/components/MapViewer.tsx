
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";

// Importing GeoRaster related imports - we'll use these in the processGeoTiff function
// These imports will be dynamically loaded within the component instead of at the top level
// to avoid SSR issues

interface MapViewerProps {
  geoTiffData: ArrayBuffer | null;
  isProcessing: boolean;
}

const MapViewer: React.FC<MapViewerProps> = ({ geoTiffData, isProcessing }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geoRasterLayerRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

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
    }

    return () => {
      // Clean up when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Process GeoTIFF data when available
  useEffect(() => {
    const processGeoTiff = async () => {
      if (!geoTiffData || !mapRef.current) return;

      try {
        // Remove existing GeoRaster layer if any
        if (geoRasterLayerRef.current && mapRef.current.hasLayer(geoRasterLayerRef.current)) {
          mapRef.current.removeLayer(geoRasterLayerRef.current);
          geoRasterLayerRef.current = null;
        }

        // Import the libraries dynamically to avoid server-side rendering issues
        const { default: parseGeoraster } = await import('georaster');
        const { default: GeoRasterLayer } = await import('georaster-layer-for-leaflet');

        // Parse the GeoTIFF data
        const arrayBuffer = geoTiffData;
        const georaster = await parseGeoraster(arrayBuffer);

        // Create GeoRasterLayer
        const layer = new GeoRasterLayer({
          georaster,
          opacity: 0.8,
          resolution: 256,
        });

        // Add the layer to the map
        layer.addTo(mapRef.current);
        geoRasterLayerRef.current = layer;

        // Set view to the layer bounds
        const bounds = layer.getBounds();
        mapRef.current.fitBounds(bounds);
        
        toast({
          title: "GeoTIFF Loaded",
          description: "The GeoTIFF has been successfully processed and displayed on the map.",
        });
      } catch (error) {
        console.error('Error processing GeoTIFF:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process the GeoTIFF file. Please try again with a different file.",
        });
      }
    };

    processGeoTiff();
  }, [geoTiffData]);

  // Export functions - these would be implemented in a full version
  const exportMBTiles = () => {
    console.log('Exporting as MBTiles...');
    toast({
      title: "Export Started",
      description: "Exporting as MBTiles...",
    });
    // Implementation for MBTiles export would go here
  };

  const exportTileDirectory = () => {
    console.log('Exporting as tile directory...');
    toast({
      title: "Export Started",
      description: "Exporting as tile directory...",
    });
    // Implementation for tile directory export would go here
  };

  const exportWMTS = () => {
    console.log('Exporting as WMTS...');
    toast({
      title: "Export Started",
      description: "Exporting as WMTS...",
    });
    // Implementation for WMTS export would go here
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200">
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <div className="flex flex-col items-center">
            <div className="pulsing-dot animate-pulse-slow mb-3"></div>
            <p className="text-sm font-medium text-map-dark-blue">Processing GeoTIFF...</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="bg-white">
              <Layers className="h-4 w-4 mr-2" />
              Layers
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-2">Base Maps</h4>
              <Select defaultValue="osm">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select base map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="osm">OpenStreetMap</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
              
              <h4 className="text-sm font-medium mt-3 mb-2">Overlay Opacity</h4>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="80"
                className="w-full" 
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="bg-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={exportMBTiles}>
                Export as MBTiles
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={exportTileDirectory}>
                Export as Tile Directory
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={exportWMTS}>
                Export as WMTS
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button size="sm" variant="outline" className="bg-white">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
      
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};

export default MapViewer;
