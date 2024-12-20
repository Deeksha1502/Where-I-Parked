import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { Camera, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  latitude: number;
  longitude: number;
  description?: string;
  photo_url?: string;
}

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16);
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export function Map() {
  const [parkedLocation, setParkedLocation] = useState<Location | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParkedLocation();
  }, []);

  const loadParkedLocation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('parking_locations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setParkedLocation(data);
    }
  };

  const saveLocation = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          description,
          user_id: user.id,
        };

        if (photo) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError, data } = await supabase.storage
            .from('parking-photos')
            .upload(fileName, photo);

          if (!uploadError && data) {
            const { data: { publicUrl } } = supabase.storage
              .from('parking-photos')
              .getPublicUrl(fileName);
            
            location.photo_url = publicUrl;
          }
        }

        const { error } = await supabase
          .from('parking_locations')
          .upsert(location);

        if (!error) {
          setParkedLocation(location);
          setDescription('');
          setPhoto(null);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="h-3/4">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
          {parkedLocation && (
            <Marker position={[parkedLocation.latitude, parkedLocation.longitude]}>
              <Popup>
                {parkedLocation.description && <p>{parkedLocation.description}</p>}
                {parkedLocation.photo_url && (
                  <img 
                    src={parkedLocation.photo_url} 
                    alt="Parking location" 
                    className="w-full h-32 object-cover mt-2"
                  />
                )}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="p-4 bg-white shadow-lg">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description (optional)"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
            <Camera className="h-6 w-6 text-gray-600" />
          </label>
          <button
            onClick={saveLocation}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </div>
    </div>
  );
}