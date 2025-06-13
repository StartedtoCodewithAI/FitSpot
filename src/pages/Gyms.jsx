import React, { useState } from "react";

const MAX_DISTANCE_METERS = 7000; // 7km radius

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Gyms() {
  const [userLocation, setUserLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState("");

  const handleAllowLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(userLoc);

        const query = `[out:json];
          (
            node["leisure"~"fitness_centre|gym"](around:${MAX_DISTANCE_METERS},${userLoc.lat},${userLoc.lng});
            way["leisure"~"fitness_centre|gym"](around:${MAX_DISTANCE_METERS},${userLoc.lat},${userLoc.lng});
            relation["leisure"~"fitness_centre|gym"](around:${MAX_DISTANCE_METERS},${userLoc.lat},${userLoc.lng});
          );
          out center;`;

        try {
          const url =
            "https://overpass-api.de/api/interpreter?data=" +
            encodeURIComponent(query);
          const response = await fetch(url);
          if (!response.ok) {
            const text = await response.text();
            throw new Error("Overpass API error: " + text);
          }
          const data = await response.json();

          const gymsFound = (data.elements || []).map((el) => {
            let lat = el.lat;
            let lng = el.lon;
            if (!lat && el.center) {
              lat = el.center.lat;
              lng = el.center.lon;
            }
            return {
              id: el.id,
              name: el.tags?.name || "Unnamed Gym",
              address:
                el.tags?.["addr:street"]
                  ? `${el.tags["addr:street"]}${el.tags["addr:housenumber"] ? " " + el.tags["addr:housenumber"] : ""}, ${el.tags["addr:city"] || ""}`
                  : el.tags?.["addr:full"] || "",
              lat,
              lng,
              tags: el.tags || {},
            };
          })
          .filter((g) => g.lat && g.lng)
          .map((g) => ({
            ...g,
            distance: getDistanceFromLatLonInKm(userLoc.lat, userLoc.lng, g.lat, g.lng),
          }))
          .sort((a, b) => a.distance - b.distance);

          setGyms(gymsFound);
        } catch (e) {
          setError("Failed to fetch gyms from OpenStreetMap: " + e.message);
        }
        setLoading(false);
      },
      (err) => {
        setPermissionDenied(true);
        setLoading(false);
        setError(
          `Error fetching location: ${err.message}. Please check your browser location settings and try again.`
        );
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "1.4rem" }}>TESTING GYMS PAGE</h1>

      {!userLocation && !permissionDenied && !loading && (
        <button
          onClick={handleAllowLocation}
          style={{
            padding: "0.9rem 2.2rem",
            fontSize: "1.13rem",
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(90deg,#2563eb,#38bdf8)",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 2px 8px #2563eb22",
            cursor: "pointer",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          Allow Location
        </button>
      )}
      {loading && (
        <div style={{ color: "#2563eb", fontWeight: 600 }}>
          Locating you and searching for real gyms...
        </div>
      )}
      {permissionDenied && (
        <div style={{
          background: "#fee2e2",
          color: "#b91c1c",
          padding: "1.1rem 1.5rem",
          borderRadius: 12,
          marginBottom: "1rem",
          maxWidth: 400
        }}>
          <strong>Location permission denied.</strong>
          <br />
          Please allow location access to see real gyms nearby.<br />
          If you see an error, please check your site settings or clear site data and try again.
        </div>
      )}
      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#b91c1c",
          padding: "1.1rem 1.5rem",
          borderRadius: 12,
          marginBottom: "1rem",
          maxWidth: 600
        }}>
          {error}
        </div>
      )}
      {userLocation && (
        <div style={{ fontSize: ".95rem", color: "#64748b", marginBottom: 14 }}>
          <strong>Your detected location:</strong>
          <br />
          Latitude: {userLocation.lat}
          <br />
          Longitude: {userLocation.lng}
        </div>
      )}

      {userLocation && gyms.length > 0 && (
        <div>
          {gyms.map((gym, i) => (
            <div key={gym.id || i} style={{padding:8, borderBottom:'1px solid #ccc'}}>
              <b>{gym.name}</b> {gym.address} {gym.distance.toFixed(2)} km
            </div>
          ))}
        </div>
      )}

      {userLocation && gyms.length === 0 && !loading && !error && (
        <div style={{ color: "#2563eb" }}>
          No real gyms found within {MAX_DISTANCE_METERS / 1000}km of your location.<br />
          Try again or widen your search radius!
        </div>
      )}
    </div>
  );
}
