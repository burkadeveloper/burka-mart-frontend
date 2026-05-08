import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import {
  Search,
  Navigation,
  Map as MapIcon,
  Satellite,
  Loader2,
} from "lucide-react";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Draggable marker component
function DraggableMarker({ position, setPosition }) {
  const map = useMap();
  const [markerRef, setMarkerRef] = useState(null);

  useEffect(() => {
    if (!markerRef) return;
    markerRef.on("dragend", () => {
      const latlng = markerRef.getLatLng();
      setPosition({ lat: latlng.lat, lng: latlng.lng });
    });
  }, [markerRef, setPosition]);

  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable={true}
      ref={setMarkerRef}
    >
      <Popup>Your delivery location (drag to adjust)</Popup>
    </Marker>
  );
}

export default function OrderMap({
  sellerLocation,
  sellerName,
  deliveryLocation,
  onDeliveryLocationChange,
  onUseCurrentLocation,
  isLocating = false,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);

  // Center map on delivery location if set, otherwise seller location, else Addis Ababa
  const center = (() => {
    if (deliveryLocation) return [deliveryLocation.lat, deliveryLocation.lng];
    if (sellerLocation) return [sellerLocation.lat, sellerLocation.lng];
    return [9.03, 38.74];
  })();

  const calculateDistance = () => {
    if (!deliveryLocation || !sellerLocation) return null;
    const R = 6371; // km
    const dLat = ((sellerLocation.lat - deliveryLocation.lat) * Math.PI) / 180;
    const dLng = ((sellerLocation.lng - deliveryLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((deliveryLocation.lat * Math.PI) / 180) *
        Math.cos((sellerLocation.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distance = calculateDistance();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=1`,
      );
      const data = await response.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onDeliveryLocationChange({ lat, lng });
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search for a location (e.g., Bole, Addis Ababa)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <Search size={18} />
          </button>
        </form>
        <button
          onClick={() => setIsSatellite(!isSatellite)}
          className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-300 transition"
          title={
            isSatellite ? "Switch to street view" : "Switch to satellite view"
          }
        >
          {isSatellite ? <MapIcon size={18} /> : <Satellite size={18} />}
        </button>
        <button
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} />
          )}
          My Location
        </button>
      </div>

      {/* Info tip */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg flex items-start gap-2">
        <span className="text-blue-500">ℹ️</span>
        <span>
          If you can't find a precise location, go to the exact spot where you
          want your order delivered and tap <strong>"My Location"</strong>. You
          can also drag the marker to adjust.
        </span>
      </div>

      {/* Map container */}
      <div className="h-80 w-full rounded-xl overflow-hidden shadow-md">
        <MapContainer
          key={isSatellite ? "sat" : "street"}
          center={center}
          zoom={13}
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
          {sellerLocation && (
            <Marker position={[sellerLocation.lat, sellerLocation.lng]}>
              <Popup>Seller: {sellerName || "Seller"}</Popup>
            </Marker>
          )}
          {deliveryLocation && (
            <DraggableMarker
              position={deliveryLocation}
              setPosition={onDeliveryLocationChange}
            />
          )}
        </MapContainer>
      </div>

      {/* Distance info */}
      {distance && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-center">
          📍 Distance from seller: <strong>{distance} km</strong>
        </div>
      )}
    </div>
  );
}
