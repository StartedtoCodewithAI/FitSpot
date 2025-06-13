import React, { useState } from "react";

// Add gyms in Agios Dimitrios and Metamorfosi, Athens
const gyms = [
  {
    id: 1,
    name: "Agios Dimitrios Fitness",
    address: "123 Dim Street, Agios Dimitrios, Athens",
    lat: 37.9397,
    lng: 23.7283
  },
  {
    id: 2,
    name: "Metamorfosi Power Gym",
    address: "456 Meta Ave, Metamorfosi, Athens",
    lat: 38.0656,
    lng: 23.7536
  },
  // Add more gyms here as needed!
];

// Haversine formula for distance in km
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

// Random code generator (8 chars)
function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

const MAX_DISTANCE_KM = 10;

export default function Gyms() {
  const [userLocation, setUserLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGym, setModalGym] = useState(null);
  const [sessionCode, setSessionCode] = useState(null);
  const [expiry, setExpiry] = useState(null);

  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(userLoc);

        // DEBUG: Log user location and distance to all gyms
        console.log("Your detected location:", userLoc);
        gyms.forEach((gym) => {
          const dist = getDistanceFromLatLonInKm(
            userLoc.lat,
            userLoc.lng,
            gym.lat,
            gym.lng
          );
          console.log(
            `Distance to "${gym.name}": ${dist.toFixed(2)} km`
          );
        });

        // Filter gyms within 10km
        const gymsWithin10km = gyms.filter((gym) => {
          const dist = getDistanceFromLatLonInKm(
            userLoc.lat,
            userLoc.lng,
            gym.lat,
            gym.lng
          );
          return dist <= MAX_DISTANCE_KM;
        });

        console.log("Gyms within 10km:", gymsWithin10km);

        setFilteredGyms(gymsWithin10km);
        setLoading(false);
      },
      (err) => {
        setPermissionDenied(true);
        setLoading(false);
        setFilteredGyms([]);
        console.error("Geolocation error:", err);
        alert(
          `Error fetching location: ${err.message}. Please check your browser location settings and try again.`
        );
      },
      { enableHighAccuracy: true }
    );
  };

  // Modal logic
  const handleGenerateCode = (gym) => {
    const code = generateRandomCode(8);
    const now = Date.now();
    const expiresAt = now + 30 * 60 * 1000; // 30 minutes from now
    setModalGym(gym);
    setSessionCode(code);
    setExpiry(expiresAt);
    setModalOpen(true);
    // Save to localStorage (demo only; backend for real app)
    localStorage.setItem(
      `fitspot-sessioncode-${code}`,
      JSON.stringify({
        gymId: gym.id,
        gymName: gym.name,
        code,
        generatedAt: now,
        expiresAt,
        used: false,
        usedAt: null,
      })
    );
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalGym(null);
    setSessionCode(null);
    setExpiry(null);
  };

  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "1.4rem" }}>Gyms Near You</h1>

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
        <div style={{ color: "#2563eb", fontWeight: 600 }}>Getting your location...</div>
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
          Please allow location access to see nearby gyms.<br />
          If you see an error, please check your site settings or clear site data and try again.
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
      {userLocation && filteredGyms.length === 0 && (
        <div style={{ color: "#2563eb" }}>
          No gyms found within {MAX_DISTANCE_KM}km of your location.<br />
          (Check your location in the debug info above. If the coordinates look wrong, try increasing the distance or check your mobile location settings.)
        </div>
      )}
      {userLocation && filteredGyms.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredGyms.map((gym) => {
            const dist = getDistanceFromLatLonInKm(
              userLocation.lat,
              userLocation.lng,
              gym.lat,
              gym.lng
            );
            return (
              <li key={gym.id} style={{
                margin: "1.5rem 0",
                padding: "1.5rem",
                background: "rgba(37,99,235,0.09)",
                borderRadius: 14,
                boxShadow: "0 2px 16px #2563eb14",
                position: "relative"
              }}>
                <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "#2563eb" }}>{gym.name}</div>
                <div style={{ color: "#0b2546", opacity: 0.8 }}>{gym.address}</div>
                <div style={{ fontSize: ".95rem", color: "#38bdf8" }}>
                  {dist.toFixed(2)} km away
                </div>
                <button
                  onClick={() => handleGenerateCode(gym)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.7rem 1.5rem",
                    background: "linear-gradient(90deg,#2563eb,#38bdf8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 9,
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #2563eb22",
                    transition: "background 0.2s",
                  }}
                >
                  Generate Session Code
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {/* Modal */}
      {modalOpen && modalGym && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(30,41,59,0.35)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 8px 32px #2563eb33",
            padding: "2.2rem 2.5rem 2.2rem 2.5rem",
            minWidth: 320,
            maxWidth: "94vw",
            textAlign: "center",
            position: "relative"
          }}>
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 18,
                right: 22,
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 700,
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ fontSize: "1.2rem", color: "#2563eb", marginBottom: 7 }}>
              One-Session Code for
            </div>
            <div style={{ fontWeight: 800, color: "#0b2546", fontSize: "1.4rem", marginBottom: 24 }}>
              {modalGym.name}
            </div>
            <div style={{
              fontSize: "2.2rem",
              letterSpacing: "0.25em",
              fontWeight: 900,
              color: "#2563eb",
              background: "#e0f2fe",
              padding: "1.1rem",
              borderRadius: 12,
              margin: "0 auto 1.3rem auto",
              textAlign: "center",
              wordBreak: "break-all",
              userSelect: "all"
            }}>
              {sessionCode}
            </div>
            <div style={{ fontSize: "1.1rem", color: "#0b2546", marginBottom: 8 }}>
              Expires: <span style={{ color: "#38bdf8" }}>{new Date(expiry).toLocaleTimeString()}</span>
            </div>
            <div style={{ fontSize: ".93rem", color: "#64748b", marginTop: 16 }}>
              Show this code to the gym staff for one session.<br />
              <span style={{ fontSize: ".90rem", color: "#d97706" }}>
                Code is valid for 30 minutes and can only be used once.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
