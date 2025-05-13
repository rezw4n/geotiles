
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { toast } from "@/hooks/use-toast";
import { initializeProj4 } from '@/utils/proj4Utils';

interface GeoTiffLayerProps {
  map: L.Map | null;
  geoTiffData: ArrayBuffer | null;
}

const GeoTiffLayer: React.FC<GeoTiffLayerProps> = ({ map, geoTiffData }) => {
  const geoRasterLayerRef = useRef<any>(null);

  useEffect(() => {
    const processGeoTiff = async () => {
      if (!geoTiffData || !map) return;

      try {
        // Remove existing GeoRaster layer if any
        if (geoRasterLayerRef.current && map.hasLayer(geoRasterLayerRef.current)) {
          map.removeLayer(geoRasterLayerRef.current);
          geoRasterLayerRef.current = null;
        }

        // Ensure proj4 is properly initialized
        initializeProj4();

        // Dynamically import the geotiff parser
        const { fromArrayBuffer } = await import('geotiff');
        
        // First parse the GeoTIFF using geotiff library
        const tiff = await fromArrayBuffer(geoTiffData);
        const image = await tiff.getImage();
        
        // Get basic metadata
        const fileDirectory = image.getFileDirectory();
        const geoKeys = fileDirectory.GeoKeyDirectory;
        const modelTiepoint = fileDirectory.ModelTiepoint;
        const modelPixelScale = fileDirectory.ModelPixelScale;
        
        if (!geoKeys && !modelTiepoint && !modelPixelScale) {
          throw new Error("Missing georeferencing information");
        }
        
        // Import georaster & georaster-layer-for-leaflet dynamically
        console.log('Importing georaster libraries...');
        const geo = await import('georaster');
        const GeoRasterLayerModule = await import('georaster-layer-for-leaflet');
        
        console.log('Parsing GeoTIFF with georaster...');
        // Parse with georaster
        const georaster = await geo.default(geoTiffData);
        
        console.log('Creating GeoRasterLayer...');
        // Create the layer
        const GeoRasterLayer = GeoRasterLayerModule.default;
        const layer = new GeoRasterLayer({
          georaster,
          opacity: 0.8,
          resolution: 256,
        });

        // Add the layer to the map
        console.log('Adding layer to map...');
        layer.addTo(map);
        geoRasterLayerRef.current = layer;

        // Set view to the layer bounds
        const bounds = layer.getBounds();
        map.fitBounds(bounds);
        
        toast({
          title: "GeoTIFF Loaded",
          description: "The GeoTIFF has been successfully processed and displayed on the map.",
        });
      } catch (error) {
        console.error('Error processing GeoTIFF:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error 
            ? `Failed to process GeoTIFF: ${error.message}` 
            : "Failed to process the GeoTIFF file. Please try again.",
        });
      }
    };

    processGeoTiff();
  }, [geoTiffData, map]);

  return null; // This is a logical component with no UI
};

export default GeoTiffLayer;
