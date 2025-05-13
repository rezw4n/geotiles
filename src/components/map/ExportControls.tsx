
import React, { useState } from 'react';
import { Download, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { toast } from "@/hooks/use-toast";
import { ProcessingService } from "@/services/ProcessingService";

interface ExportOptions {
  fileName: string;
  minZoom: number;
  maxZoom: number;
}

interface ExportControlsProps {
  geoTiffData: ArrayBuffer | null;
}

const ExportControls: React.FC<ExportControlsProps> = ({ geoTiffData }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    fileName: 'export',
    minZoom: 10,
    maxZoom: 16
  });

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

  // Export MBTiles
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
      const blob = ProcessingService.exportAsMBTiles(geoTiffData, exportOptions.fileName);
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

  // Export Tile Directory
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
      const blob = ProcessingService.exportAsTileDirectory(
        geoTiffData, 
        exportOptions.fileName,
        exportOptions.minZoom,
        exportOptions.maxZoom
      );
      
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

  // Export WMTS
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
      const wmtsCapabilities = ProcessingService.generateWMTSCapabilities(
        exportOptions.fileName,
        exportOptions.minZoom,
        exportOptions.maxZoom
      );
      
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

  // Export WMS
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
      const wmsCapabilities = ProcessingService.generateWMSCapabilities(exportOptions.fileName);
      
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
    </div>
  );
};

export default ExportControls;
