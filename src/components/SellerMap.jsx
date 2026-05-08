import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useSellerLocation } from "../api/locationApi";
import LoadingSpinner from "./LoadingSpinner";

// Create a custom, bigger marker icon (SVG data URL, no external HTTP request)
const customMarkerIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <path fill="#3b82f6" d="M24 2C16.26 2 10 8.26 10 16c0 10.5 14 26 14 26s14-15.5 14-26c0-7.74-6.26-14-14-14zm0 19.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
      <circle cx="24" cy="16" r="4" fill="white"/>
    </svg>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -38],
  className: "custom-marker",
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
      {/* Satellite toggle button */}
      <button
        onClick={() => setIsSatellite(!isSatellite)}
        className="absolute top-2 right-2 z-[1000] bg-white dark:bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium"
        style={{ zIndex: 1000 }}
      >
        {isSatellite ? "🗺️ Street" : "🛰️ Satellite"}
      </button>

      <MapContainer
        key={mapKey}
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
        <Marker position={position} icon={customMarkerIcon}>
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
