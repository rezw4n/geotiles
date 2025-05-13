
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Info, Settings, Landmark } from 'lucide-react';

import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import MapViewer from '@/components/MapViewer';
import { ProcessingService, ProcessingResult } from '@/services/ProcessingService';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [geoTiffData, setGeoTiffData] = useState<ArrayBuffer | null>(null);
  const { toast } = useToast();

  const handleFileSelected = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setActiveTab('processing');

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Process the GeoTIFF
      const result: ProcessingResult = await ProcessingService.processGeoTIFF(file);

      if (result.success && result.data) {
        setGeoTiffData(result.data);
        setActiveTab('result');
        toast({
          title: "Processing complete",
          description: "Your GeoTIFF has been successfully processed.",
        });
      } else {
        toast({
          title: "Processing failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
        setActiveTab('upload');
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
      setActiveTab('upload');
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-map-dark-blue">GeoTIFF Visualizer</h1>
            <p className="text-gray-600 mt-2">
              Upload, process, and visualize georeferenced TIFF images in various formats.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                      <TabsTrigger value="processing" disabled={!isProcessing}>Processing</TabsTrigger>
                      <TabsTrigger value="result" disabled={!geoTiffData}>Result</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-0">
                      <FileUploader 
                        onFileSelected={handleFileSelected} 
                        isProcessing={isProcessing}
                      />
                    </TabsContent>
                    
                    <TabsContent value="processing" className="mt-0">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="pulsing-dot animate-pulse-slow mb-4"></div>
                        <h3 className="text-lg font-medium mb-2">Processing GeoTIFF</h3>
                        <p className="text-sm text-gray-500 text-center">
                          Please wait while we process your file. This may take a few moments depending on the file size.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="result" className="mt-0">
                      <div className="py-4">
                        <h3 className="text-lg font-medium mb-4">Processing Complete</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-700 mb-1">Your GeoTIFF has been processed successfully.</p>
                            <p className="text-sm text-gray-500">You can view it on the map and export it in various formats.</p>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Export Options</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" size="sm">MBTiles</Button>
                              <Button variant="outline" size="sm">Tile Directory</Button>
                              <Button variant="outline" size="sm">WMTS</Button>
                              <Button variant="outline" size="sm">WMS</Button>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-sm"
                              onClick={() => setActiveTab('upload')}
                            >
                              Upload a new file
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-map-blue mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium mb-1">About GeoTIFF Files</h3>
                      <p className="text-xs text-gray-500">
                        GeoTIFF is a public domain metadata standard which allows georeferencing information to be embedded within a TIFF file.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </h3>
                  
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Processing Quality</span>
                      <select className="text-xs px-2 py-1 rounded border">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Tile Size</span>
                      <select className="text-xs px-2 py-1 rounded border">
                        <option>256x256</option>
                        <option>512x512</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                  {(!geoTiffData && !isProcessing) ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="flex justify-center mb-4">
                          <Landmark className="h-12 w-12 text-map-blue/30" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No GeoTIFF Loaded</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          Upload a GeoTIFF file to visualize it on the map. The map will display here after processing.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MapViewer geoTiffData={geoTiffData} isProcessing={isProcessing} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 GeoTIFF Visualizer. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-map-blue">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-map-blue">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-map-blue">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
