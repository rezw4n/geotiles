
import { fromArrayBuffer } from 'geotiff';

export interface ProcessingResult {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
}

export class ProcessingService {
  // This method processes the GeoTIFF file and returns the data
  static async processGeoTIFF(file: File): Promise<ProcessingResult> {
    try {
      console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      console.log("File read as ArrayBuffer successfully");
      
      // Validate the GeoTIFF
      console.log("Validating GeoTIFF...");
      const validationResult = await this.validateGeoTIFF(arrayBuffer);
      
      if (!validationResult.valid) {
        console.error("GeoTIFF validation failed:", validationResult.error);
        return {
          success: false,
          error: validationResult.error || "Invalid GeoTIFF format or missing georeferencing information",
        };
      }
      
      console.log("GeoTIFF validation successful");
      
      // In a real application, we would do more processing here
      // like creating tiles, MBTiles, etc.
      
      return {
        success: true,
        data: arrayBuffer,
      };
    } catch (error) {
      console.error("Error processing GeoTIFF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error processing file",
      };
    }
  }

  // Helper to read file as ArrayBuffer
  private static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Improved validation for GeoTIFF files
  private static async validateGeoTIFF(arrayBuffer: ArrayBuffer): Promise<{valid: boolean, error?: string}> {
    try {
      console.log("Parsing GeoTIFF with geotiff library...");
      const tiff = await fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      
      console.log("Checking for georeferencing information...");
      // Check for some basic georeferencing info
      const fileDirectory = image.getFileDirectory();
      
      // Log file directory keys to help diagnose issues
      console.log("File directory keys:", Object.keys(fileDirectory));
      
      const geoKeys = fileDirectory.GeoKeyDirectory;
      
      if (!geoKeys) {
        console.log("No GeoKeyDirectory found, checking for ModelTiepoint...");
        // Some GeoTIFFs use ModelTiepoint instead of GeoKeyDirectory
        const modelTiepoint = fileDirectory.ModelTiepoint;
        const modelPixelScale = fileDirectory.ModelPixelScale;
        
        if (!modelTiepoint && !modelPixelScale) {
          return { valid: false, error: "Missing georeferencing information in GeoTIFF" };
        }
      }
      
      // Additional validation - check raster dimensions
      const width = image.getWidth();
      const height = image.getHeight();
      
      console.log(`Raster dimensions: ${width}x${height}`);
      
      if (width <= 0 || height <= 0) {
        return { valid: false, error: "Invalid raster dimensions" };
      }
      
      // Check for sample format
      console.log("Checking sample format...");
      const sampleFormat = fileDirectory.SampleFormat || [1];
      const bitsPerSample = fileDirectory.BitsPerSample || [1];
      
      console.log(`Sample format: ${sampleFormat}, Bits per sample: ${bitsPerSample}`);
      
      return { valid: true };
    } catch (error) {
      console.error("Error validating GeoTIFF:", error);
      return { 
        valid: false, 
        error: error instanceof Error ? `Validation error: ${error.message}` : "Unknown error validating GeoTIFF" 
      };
    }
  }

  // Method to export as MBTiles - in a real application, this would generate MBTiles
  static exportAsMBTiles(data: ArrayBuffer): Blob {
    // This is a placeholder. In a real app, we'd convert the GeoTIFF to MBTiles format
    // For now, just returning the data as a Blob
    return new Blob([data], { type: 'application/octet-stream' });
  }

  // Method to export as Tile Directory - in a real application, this would generate a zip with tiles
  static exportAsTileDirectory(data: ArrayBuffer): Blob {
    // This is a placeholder
    return new Blob([data], { type: 'application/zip' });
  }

  // Method to export WMTS capabilities XML
  static generateWMTSCapabilities(layerName: string): string {
    // This would generate a WMTS capabilities XML in a real application
    return `<?xml version="1.0" encoding="UTF-8"?>
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
            <ows:Title>${layerName}</ows:Title>
            <ows:Identifier>${layerName}</ows:Identifier>
            <!-- Additional layer information would go here -->
          </Layer>
        </Contents>
      </Capabilities>`;
  }
}
