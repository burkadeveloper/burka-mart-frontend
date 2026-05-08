import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import { useUpdateLocation } from "../api/locationApi";
import toast from "react-hot-toast";

// Fix marker icon (same as above)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ initialLat, initialLng, onSave }) {
  const [lat, setLat] = useState(initialLat || 9.03);
  const [lng, setLng] = useState(initialLng || 38.74);
  const [city, setCity] = useState("");
  const [subCity, setSubCity] = useState("");
  const { mutate: updateLocation, isLoading } = useUpdateLocation();

  const handleLocationSelect = (latitude, longitude) => {
    setLat(latitude);
    setLng(longitude);
  };

  const handleSave = () => {
    if (!city) {
      toast.error("Please enter city name");
      return;
    }
    updateLocation(
      {
        city,
        subCity,
        coordinates: { lat, lng },
      },
      {
        onSuccess: () => {
          toast.success("Location saved");
          if (onSave) onSave();
        },
        onError: () => toast.error("Failed to save location"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div style={{ height: "300px" }} className="rounded-lg overflow-hidden">
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border rounded-lg p-2"
        />
        <input
          type="text"
          placeholder="Sub City"
          value={subCity}
          onChange={(e) => setSubCity(e.target.value)}
          className="border rounded-lg p-2"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
      >
        {isLoading ? "Saving..." : "Save Location"}
      </button>
    </div>
  );
}
