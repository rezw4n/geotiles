
import proj4 from 'proj4';

export const initializeProj4 = () => {
  // Define window.proj4 to ensure compatibility with georaster-layer-for-leaflet
  if (typeof window !== 'undefined') {
    window.proj4 = proj4;
    
    // Add common projections
    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
      ['EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs'],
      ['EPSG:32633', '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'],
      ['EPSG:3785', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs']
    ]);
    
    // Fix for the m2.defs and s2.defs not a function error
    // Ensure that all references to proj4 have the defs function
    const originalProj4 = window.proj4;
    window.proj4 = function(...args: any[]) {
      return originalProj4(...args);
    };
    window.proj4.defs = originalProj4.defs;
  }
};
