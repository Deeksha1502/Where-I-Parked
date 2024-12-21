import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { Camera, Navigation, MapPin } from 'lucide-react';
import L, { LatLng } from 'leaflet';
import { LocationMarker } from './LocationMarker';
import { NavigationPath } from './NavigationPath';
import { MapClickHandler } from './MapClickHandler';

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

export function Map() {
  const [parkedLocation, setParkedLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

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

  const handleLocationSelect = (location: LatLng) => {
    if (selectionMode) {
      setSelectedLocation(location);
      setSelectionMode(false);
    }
  };

  const saveLocation = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const locationToSave = selectedLocation || currentLocation;
      
      if (!locationToSave) {
        alert('Please select a location or wait for your current location to be detected');
        return;
      }

      const location = {
        latitude: locationToSave.lat,
        longitude: locationToSave.lng,
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
        setSelectedLocation(null);
        setDescription('');
        setPhoto(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (location: LatLng) => {
    setCurrentLocation(location);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="h-3/4 relative">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker onLocationUpdate={handleLocationUpdate} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {selectedLocation && (
            <Marker position={selectedLocation}>
              <Popup>Selected parking location</Popup>
            </Marker>
          )}
          
          {parkedLocation && (
            <>
              <Marker position={[parkedLocation.latitude, parkedLocation.longitude]}>
                <Popup>
                  <div className="max-w-xs">
                    <p className="font-semibold">Parked Location</p>
                    {parkedLocation.description && (
                      <p className="text-gray-600 mt-1">{parkedLocation.description}</p>
                    )}
                    {parkedLocation.photo_url && (
                      <img 
                        src={parkedLocation.photo_url} 
                        alt="Parking location" 
                        className="w-full h-32 object-cover mt-2 rounded"
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
              <NavigationPath 
                currentLocation={currentLocation} 
                parkedLocation={[parkedLocation.latitude, parkedLocation.longitude]} 
              />
            </>
          )}
        </MapContainer>
        {selectionMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-[1000]">
            Click anywhere on the map to select parking location
          </div>
        )}
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
            onClick={() => setSelectionMode(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Select on Map
          </button>
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