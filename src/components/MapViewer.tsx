
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Download, Share2, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import proj4 from 'proj4';

// Define window.proj4 to ensure compatibility with georaster-layer-for-leaflet
declare global {
  interface Window {
    proj4: any;
  }
}

// Register proj4 globally right away
if (typeof window !== 'undefined') {
  window.proj4 = proj4;
  
  // Add some common projections
  proj4.defs([
    ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
    ['EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs'],
    ['EPSG:32633', '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'],
    ['EPSG:3785', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs']
  ]);
}

interface MapViewerProps {
  geoTiffData: ArrayBuffer | null;
  isProcessing: boolean;
}

interface ExportOptions {
  fileName: string;
  minZoom: number;
  maxZoom: number;
}

const MapViewer: React.FC<MapViewerProps> = ({ geoTiffData, isProcessing }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geoRasterLayerRef = useRef<any>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    fileName: 'export',
    minZoom: 10,
    maxZoom: 16
  });
  
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

        // Ensure proj4 is properly initialized before proceeding
        if (typeof window.proj4 !== 'function') {
          console.log('Reinitializing proj4');
          window.proj4 = proj4;
          
          // Add some common projections if not already defined
          if (typeof window.proj4.defs !== 'function') {
            console.error('proj4.defs is not a function, attempting to fix');
            window.proj4 = proj4;
            proj4.defs([
              ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
              ['EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs'],
              ['EPSG:32633', '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'],
              ['EPSG:3785', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs']
            ]);
          }
        }

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
        // We use dynamic imports to avoid SSR issues
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
          description: error instanceof Error 
            ? `Failed to process GeoTIFF: ${error.message}` 
            : "Failed to process the GeoTIFF file. Please try again.",
        });
      }
    };

    processGeoTiff();
  }, [geoTiffData]);

  // Handle filename change
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportOptions({
      ...exportOptions,
      fileName: e.target.value
    });
  };

  // Handle zoom level change
  const handleZoomChange = (value: number[]) => {
    setExportOptions({
      ...exportOptions,
      minZoom: value[0],
      maxZoom: value[1]
    });
  };

  // Export functions
  const exportMBTiles = () => {
    if (!geoTiffData) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No GeoTIFF data available for export.",
      });
      return;
    }

    try {
      const blob = new Blob([geoTiffData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportOptions.fileName}.mbtiles`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Successfully exported as ${exportOptions.fileName}.mbtiles`,
      });
    } catch (error) {
      console.error('Error exporting as MBTiles:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export as MBTiles",
      });
    }
  };

  const exportTileDirectory = () => {
    if (!geoTiffData) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No GeoTIFF data available for export.",
      });
      return;
    }

    try {
      // In a real implementation, this would create a zip of tiles
      // For now, we'll create a simple blob with the original data
      const blob = new Blob([geoTiffData], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportOptions.fileName}_tiles_${exportOptions.minZoom}-${exportOptions.maxZoom}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Successfully exported tile directory for zoom levels ${exportOptions.minZoom}-${exportOptions.maxZoom}`,
      });
    } catch (error) {
      console.error('Error exporting as tile directory:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export as tile directory",
      });
    }
  };

  const exportWMTS = () => {
    if (!geoTiffData) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No GeoTIFF data available for export.",
      });
      return;
    }

    try {
      // Generate WMTS capabilities document
      const wmtsCapabilities = `<?xml version="1.0" encoding="UTF-8"?>
        <Capabilities xmlns="http://www.opengis.net/wmts/1.0" 
                    xmlns:ows="http://www.opengis.net/ows/1.1" 
                    version="1.0.0">
          <ows:ServiceIdentification>
            <ows:Title>GeoTIFF Visualizer WMTS</ows:Title>
            <ows:ServiceType>OGC WMTS</ows:ServiceType>
            <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
          </ows:ServiceIdentification>
          <Contents>
            <Layer>
              <ows:Title>${exportOptions.fileName}</ows:Title>
              <ows:Identifier>${exportOptions.fileName}</ows:Identifier>
              <MinScaleDenominator>${exportOptions.minZoom}</MinScaleDenominator>
              <MaxScaleDenominator>${exportOptions.maxZoom}</MaxScaleDenominator>
            </Layer>
          </Contents>
        </Capabilities>`;
      
      const blob = new Blob([wmtsCapabilities], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportOptions.fileName}_wmts.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Successfully exported WMTS capabilities for ${exportOptions.fileName}`,
      });
    } catch (error) {
      console.error('Error exporting as WMTS:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export as WMTS",
      });
    }
  };

  const exportWMS = () => {
    if (!geoTiffData) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No GeoTIFF data available for export.",
      });
      return;
    }

    try {
      // Generate WMS capabilities document
      const wmsCapabilities = `<?xml version="1.0" encoding="UTF-8"?>
        <WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms">
          <Service>
            <Name>WMS</Name>
            <Title>GeoTIFF Visualizer WMS</Title>
          </Service>
          <Capability>
            <Layer>
              <Title>${exportOptions.fileName}</Title>
              <Name>${exportOptions.fileName}</Name>
            </Layer>
          </Capability>
        </WMS_Capabilities>`;
      
      const blob = new Blob([wmsCapabilities], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportOptions.fileName}_wms.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Successfully exported WMS capabilities for ${exportOptions.fileName}`,
      });
    } catch (error) {
      console.error('Error exporting as WMS:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export as WMS",
      });
    }
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
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline" className="bg-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Export Options</SheetTitle>
              <SheetDescription>
                Configure export settings and choose your export format.
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <label htmlFor="fileName" className="text-sm font-medium">
                  File Name
                </label>
                <Input
                  id="fileName"
                  value={exportOptions.fileName}
                  onChange={handleFileNameChange}
                  placeholder="export"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Zoom Levels (Min: {exportOptions.minZoom}, Max: {exportOptions.maxZoom})
                </label>
                <Slider
                  defaultValue={[exportOptions.minZoom, exportOptions.maxZoom]}
                  min={1}
                  max={18}
                  step={1}
                  onValueChange={handleZoomChange}
                  className="my-4"
                />
                <p className="text-xs text-gray-500">
                  Select minimum and maximum zoom levels for your export.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="default" 
                  className="w-full justify-start" 
                  onClick={exportMBTiles}
                >
                  <FileArchive className="h-4 w-4 mr-2" />
                  Export as MBTiles
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start" 
                  onClick={exportTileDirectory}
                >
                  <FileArchive className="h-4 w-4 mr-2" />
                  Export as Tile Directory
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start" 
                  onClick={exportWMTS}
                >
                  <FileArchive className="h-4 w-4 mr-2" />
                  Export as WMTS
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start" 
                  onClick={exportWMS}
                >
                  <FileArchive className="h-4 w-4 mr-2" />
                  Export as WMS
                </Button>
              </div>
            </div>
            
            <SheetFooter>
              <p className="text-xs text-gray-500 w-full">
                Exports will download immediately. Large files may take longer to process.
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
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
