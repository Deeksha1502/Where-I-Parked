/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'leaflet' {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    class Control extends L.Control {
      constructor(options: RoutingControlOptions);
      setWaypoints(waypoints: L.LatLng[]): this;
    }

    interface OSRMv1Options {
      serviceUrl: string;
      profile?: string;
    }

    function control(options: RoutingControlOptions): Control;
    function osrmv1(options: OSRMv1Options): any;
  }

    export function latLng(lat: any, lng: any): L.LatLng {
        throw new Error('Function not implemented.');
    }
}

declare module 'leaflet-routing-machine' {
  export = L.Routing;
}