import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { latLng, LatLngExpression } from 'leaflet';
import 'leaflet-routing-machine';
import { LatLng } from 'leaflet';

interface NavigationPathProps {
  currentLocation: LatLng | null;
  parkedLocation: LatLngExpression | null;
}

export function NavigationPath({ currentLocation, parkedLocation }: NavigationPathProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (currentLocation && parkedLocation) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(currentLocation.lat, currentLocation.lng),
          L.latLng(parkedLocation[0], parkedLocation[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'foot'
        }),
        lineOptions: {
          styles: [
            { color: 'blue', opacity: 0.7, weight: 5 }
          ]
        },
        createMarker: () => null
      }).addTo(map);

      // Remove the default routing instructions container
      const container = document.querySelector('.leaflet-routing-container');
      if (container) {
        container.remove();
      }
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [currentLocation, parkedLocation, map]);

  return null;
}