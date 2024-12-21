declare module 'leaflet-routing-machine' {
    import * as L from 'leaflet';
  
    namespace Routing {
      interface RoutingControlOptions {
        waypoints: L.LatLng[];
        router?: any;
        routeWhileDragging?: boolean;
        showAlternatives?: boolean;
        addWaypoints?: boolean;
        draggableWaypoints?: boolean;
        fitSelectedRoutes?: boolean;
        lineOptions?: {
          styles?: {
            color: string;
            opacity: number;
            weight: number;
          }[];
        };
        createMarker?: (i: number, waypoint: any, n: number) => L.Marker | null;
      }
  
      interface Control extends L.Control {
        new(options: RoutingControlOptions): Control;
        setWaypoints(waypoints: L.LatLng[]): this;
      }
  
      interface OSRMv1Options {
        serviceUrl: string;
        profile?: string;
      }
  
      interface ControlStatic {
        (options: RoutingControlOptions): Control;
      }
  
      interface OSRMv1Static {
        (options: OSRMv1Options): any;
      }
  
      const control: ControlStatic;
      const osrmv1: OSRMv1Static;
    }
  
    export = Routing;
  }