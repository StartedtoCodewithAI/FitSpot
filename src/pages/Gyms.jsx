import React, { useState, useEffect } from "react";

// Example gyms data with lat/lng (make sure you have this or get it dynamically)
const gyms = [
  { id: 1, name: "Fit Gym", lat: 40.7128, lng: -74.006 },
  { id: 2, name: "Power House", lat: 40.73061, lng: -73.935242 },
  // Add more gyms here
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
  const radius = 10; // radius in km

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError("Unable to retrieve your location.");
        }
      );
    }
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!location) {
    return <p>Loading location...</p>;
  }

  const closeGyms = gyms.filter((gym) =>
    getDistance(location.lat, location.lng, gym.lat, gym.lng) <= radius
  );

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Nearby Gyms</h1>
      {closeGyms.length === 0 ? (
        <p>No nearby gyms found within {radius} km.</p>
      ) : (
        closeGyms.map((gym) => (
          <div key={gym.id} style={{ marginBottom: "1rem" }}>
            <h3>{gym.name}</h3>
            <p>
              Distance:{" "}
              {getDistance(location.lat, location.lng, gym.lat, gym.lng).toFixed(2)} km
            </p>
          </div>
        ))
      )}
    </div>
  );
}
