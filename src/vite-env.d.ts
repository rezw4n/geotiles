
/// <reference types="vite/client" />

declare module 'georaster';
declare module 'georaster-layer-for-leaflet' {
  import L from 'leaflet';
  
  interface GeoRasterLayerOptions {
    georaster: any;
    opacity?: number;
    resolution?: number;
    pixelValuesToColorFn?: (values: number[]) => string;
    debugLevel?: number;
    noDataValue?: number;
    bounds?: L.LatLngBoundsExpression;
    pane?: string;
  }

  class GeoRasterLayer extends L.Layer {
    constructor(options: GeoRasterLayerOptions);
    getBounds(): L.LatLngBounds;
  }

  export default GeoRasterLayer;
}
