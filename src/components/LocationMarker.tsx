import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";

export function LocationMarker({
    onLocationUpdate
}: {
    onLocationUpdate: (location: LatLng) => void
}) {

    const [position, setPosition] = useState<LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        map.locate({ watch: true });

        const onLocationFound = (e: any) => {
            setPosition(e.LatLng);
            onLocationUpdate(e.latlng);
            map.flyTo(e.latlng, map.getZoom())
        }
        map.on("locationfound", onLocationFound);

        return () => {
            map.off("locationfound", onLocationFound);
        }
    }, [map, onLocationUpdate]);
    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    )

}