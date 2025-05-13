
import React from 'react';
import { Layers, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MapControls: React.FC = () => {
  return (
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
  );
};

export default MapControls;
