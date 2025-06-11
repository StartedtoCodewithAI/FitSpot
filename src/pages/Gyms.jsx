import React, { useState, useEffect } from "react";

// Example gyms data around Athens, Greece (Agios Dimitrios area)
const gyms = [
  { id: 1, name: "Agios Dimitrios Gym", lat: 37.9307, lng: 23.7200 },
  { id: 2, name: "Athens Fitness Center", lat: 37.9838, lng: 23.7275 },
  { id: 3, name: "Elliniko Gym", lat: 37.8709, lng: 23.7334 },
  { id: 4, name: "Glyfada Workout Hub", lat: 37.8752, lng: 23.7533 },
  { id: 5, name: "Paleo Faliro Gym", lat: 37.9433, lng: 23.6861 },
];

// Haversine formula for distance between two lat/lng points
function getDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

export default function Gyms() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); // loading state
  const radius = 10; // radius in km

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          setError("Unable to retrieve your location.");
          setLoading(false);
        }
      );
    }
  }, []);

  // Filter gyms by search term, then by distance
  const filteredGyms = gyms.filter((gym) =>
    gym.name.toLowerCase().includes(search.toLowerCase())
  );
  const closeGyms = location
    ? filteredGyms.filter(
        (gym) =>
          getDistance(location.lat, location.lng, gym.lat, gym.lng) <= radius
      )
    : [];

  return (
    <div style={{ padding: "1rem", minHeight: "70vh" }}>
      <h1>Nearby Gyms</h1>
      <input
        type="text"
        placeholder="Search gyms by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1.5rem" }}
      />

      {loading && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "6px solid #ddd",
            borderTop: "6px solid #1976d2",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "auto"
          }} />
          <p>Getting your location...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
              }
            `}
          </style>
        </div>
      )}

      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {closeGyms.length === 0 ? (
            <p style={{ color: "#888" }}>
              No gyms found matching your search within {radius} km.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                marginTop: "1rem",
              }}
            >
              {closeGyms.map((gym) => (
                <div
                  key={gym.id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    padding: "1.2rem",
                    minWidth: "220px",
                    flex: "1 0 220px",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>{gym.name}</h3>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.1em" }}>
                    Distance:{" "}
                    <strong>
                      {getDistance(
                        location.lat,
                        location.lng,
                        gym.lat,
                        gym.lng
                      ).toFixed(2)}{" "}
                      km
                    </strong>
                  </p>
                  {/* Add more details here if you have them */}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
