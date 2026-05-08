import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useSellerLocation } from "../api/locationApi";
import LoadingSpinner from "./LoadingSpinner";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function SellerMap({ sellerId, height = "300px", zoom = 13 }) {
  const { data, isLoading, error } = useSellerLocation(sellerId);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [isSatellite, setIsSatellite] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (data?.location?.coordinates) {
      const lat = Number(data.location.coordinates.lat);
      const lng = Number(data.location.coordinates.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
        setAddress(
          `${data.location.city || ""} ${data.location.subCity || ""}`.trim(),
        );
        setMapKey((prev) => prev + 1);
      }
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (error || !position) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
        📍 Seller location not set
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-md"
      style={{ height }}
    >
      {/* Toggle button (outside MapContainer but inside relative container) */}
      <button
        onClick={() => setIsSatellite(!isSatellite)}
        className="absolute top-2 right-2 z-[1000] bg-white dark:bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium"
        style={{ zIndex: 1000 }}
      >
        {isSatellite ? "🗺️ Street" : "🛰️ Satellite"}
      </button>

      <MapContainer
        key={mapKey} // Force re-mount when toggling satellite (clean slate)
        center={position}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        {!isSatellite ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        <Marker position={position}>
          <Popup>
            <strong>Seller Location</strong>
            <br />
            {address || "Exact location"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
