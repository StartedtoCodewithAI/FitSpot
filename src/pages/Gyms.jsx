import React, { useState, useEffect } from "react";

const gyms = [
  { id: 1, name: "Gym A", lat: 40.7128, lng: -74.006 },
  { id: 2, name: "Gym B", lat: 40.73061, lng: -73.935242 },
  { id: 3, name: "Gym C", lat: 40.758, lng: -73.9855 },
];

function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export default function Gyms() {
  const [location, setLocation] = useState({ lat: null, lng: null, error: null });
  const [nearbyGyms, setNearbyGyms] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lng: null, error: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng, error: null });

        const closeGyms = gyms.filter((gym) => getDistance(lat, lng, gym.lat, gym.lng) <= 5);
        setNearbyGyms(closeGyms);
      },
      (err) => setLocation({ lat: null, lng: null, error: err.message })
    );
  }, []);

  if (location.error) return <p>Error: {location.error}</p>;
  if (location.lat === null) return <p>Loading location...</p>;
  if (nearbyGyms.length === 0) return <p>No nearby gyms found within 5 km.</p>;

  return (
    <div>
      <h2>Nearby Gyms</h2>
      <ul>
        {nearbyGyms.map((gym) => (
          <li key={gym.id}>{gym.name}</li>
        ))}
      </ul>
    </div>
  );
}
