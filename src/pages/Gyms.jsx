import React, { useState, useEffect } from "react";

const gyms = [
  // Example gyms; replace/add your own with latitude & longitude
  { id: 1, name: "Fit Gym Central", address: "123 Main St", lat: 40.7128, lng: -74.006 },
  { id: 2, name: "Muscle Factory", address: "456 Elm St", lat: 40.7228, lng: -74.016 },
  { id: 3, name: "Iron Paradise", address: "789 Oak Ave", lat: 40.755, lng: -73.98 },
  { id: 4, name: "Far Away Gym", address: "999 Distant Rd", lat: 41.2, lng: -73.8 },
  // ...add your real gyms here
];

// Helper to calculate distance between 2 lat/lng points in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
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
  const [filteredGyms, setFilteredGyms] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setPermissionDenied(true),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const gymsWithin10km = gyms.filter((gym) => {
      const dist = getDistanceFromLatLonInKm(
        userLocation.lat,
        userLocation.lng,
        gym.lat,
        gym.lng
      );
      return dist <= 10;
    });
    setFilteredGyms(gymsWithin10km);
  }, [userLocation]);

  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
      <h1>Nearby Gyms</h1>
      {!userLocation && !permissionDenied && (
        <div>Getting your location...</div>
      )}
      {permissionDenied && (
        <div>
          <strong>Location permission denied.</strong>
          <br />
          Please allow location access to see nearby gyms.
        </div>
      )}
      {userLocation && filteredGyms.length === 0 && (
        <div>No gyms found within 10km of your location.</div>
      )}
      {userLocation && filteredGyms.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredGyms.map((gym) => (
            <li key={gym.id} style={{ margin: "1.5rem 0", padding: "1.5rem", background: "rgba(38,99,235,0.09)", borderRadius: 14, boxShadow: "0 2px 16px #2563eb14" }}>
              <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "#2563eb" }}>{gym.name}</div>
              <div style={{ color: "#0b2546", opacity: 0.7 }}>{gym.address}</div>
              <div style={{ fontSize: ".95rem", color: "#38bdf8" }}>
                {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, gym.lat, gym.lng).toFixed(2)} km away
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
