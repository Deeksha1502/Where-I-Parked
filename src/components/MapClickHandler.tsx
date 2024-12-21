import { LatLng } from "leaflet";
import { useMapEvents } from "react-leaflet";

interface MapCliclHandlerProps {
    onLocationSelect: (location: LatLng) => void
}

export function MapClickHandler({
    onLocationSelect
}: MapCliclHandlerProps) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng)
        }
    })

    return null
}