
import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check if file is a GeoTIFF
    if (!file.name.toLowerCase().endsWith('.tif') && !file.name.toLowerCase().endsWith('.tiff')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a GeoTIFF file (.tif or .tiff)",
        variant: "destructive"
      });
      return;
    }

    // Process the file
    onFileSelected(file);
    toast({
      title: "File uploaded",
      description: `Processing ${file.name}...`,
    });
  };

  return (
    <div 
      className={`file-drop-area p-8 flex flex-col items-center justify-center ${dragActive ? 'active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="mb-4 p-3 rounded-full bg-map-light-blue/20">
        <Upload className="h-8 w-8 text-map-blue" />
      </div>
      
      <h3 className="text-lg font-medium mb-2">Upload GeoTIFF</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Drag and drop your GeoTIFF file here, or click to select a file
      </p>
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".tif,.tiff"
        disabled={isProcessing}
      />
      
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="border-map-blue text-map-blue hover:bg-map-blue hover:text-white"
      >
        Select File
      </Button>
      
      <p className="mt-4 text-xs text-gray-400">
        Maximum file size: 500MB
      </p>
    </div>
  );
};

export default FileUploader;
