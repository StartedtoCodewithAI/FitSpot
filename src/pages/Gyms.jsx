import React, { useState, useEffect } from "react";
import './Gyms.css';

// Sample gyms data
const gyms = [
  {
    id: 1,
    name: "Agios Dimitrios Gym",
    lat: 37.9307,
    lng: 23.7200,
    address: "12 Main St, Agios Dimitrios, Athens",
    hours: "06:00 - 22:00",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Athens Fitness Center",
    lat: 37.9838,
    lng: 23.7275,
    address: "33 Central Ave, Athens",
    hours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?fit=crop&w=400&q=80"
  },
  {
    id: 3,
    name: "Elliniko Gym",
    lat: 37.8709,
    lng: 23.7334,
    address: "99 Beach Rd, Elliniko",
    hours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=400&q=80"
  },
  {
    id: 4,
    name: "Glyfada Workout Hub",
    lat: 37.8752,
    lng: 23.7533,
    address: "45 Sun St, Glyfada",
    hours: "06:30 - 22:30",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?fit=crop&w=400&q=80"
  },
  {
    id: 5,
    name: "Paleo Faliro Gym",
    lat: 37.9433,
    lng: 23.6861,
    address: "77 Park Ave, Paleo Faliro",
    hours: "07:30 - 21:30",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?fit=crop&w=400&q=80"
  },
];

// Haversine formula for distance
function getDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) { return (x * Math.PI) / 180; }
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

// Helper for localStorage favorites
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    return [];
  }
}
function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

export default function Gyms() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(loadFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const radius = 10; // km

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

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const filteredGyms = gyms.filter((gym) =>
    gym.name.toLowerCase().includes(search.toLowerCase())
  );
  const closeGyms = location
    ? filteredGyms.filter(
        (gym) =>
          getDistance(location.lat, location.lng, gym.lat, gym.lng) <= radius
      )
    : [];

  const favoriteGyms = closeGyms.filter((gym) => favorites.includes(gym.id));

  const toggleFavorite = (gymId) => {
    setFavorites((prev) =>
      prev.includes(gymId)
        ? prev.filter((id) => id !== gymId)
        : [...prev, gymId]
    );
  };

  return (
    <div className="gyms-container">
      <h1>Nearby Gyms</h1>
      <input
        type="text"
        placeholder="Search gyms by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1.5rem" }}
      />
      <button
        onClick={() => setShowFavorites((show) => !show)}
        style={{
          marginBottom: "1rem",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        {showFavorites ? "Show All Gyms" : "Show My Favorites"}
      </button>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <div style={{
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
          {(showFavorites ? favoriteGyms : closeGyms).length === 0 ? (
            <p style={{ color: "#888" }}>
              No gyms found {showFavorites ? "in your favorites" : `matching your search within ${radius} km`}.
            </p>
          ) : (
            <div className="gyms-cards">
              {(showFavorites ? favoriteGyms : closeGyms).map((gym) => (
                <div className="gym-card" key={gym.id}>
                  <button
                    aria-label="Favorite"
                    onClick={() => toggleFavorite(gym.id)}
                    className={`heart-btn${favorites.includes(gym.id) ? " favorited" : ""}`}
                  >
                    {favorites.includes(gym.id) ? "❤️" : "🤍"}
                  </button>
                  <img src={gym.image} alt={gym.name} />
                  <div className="gym-card-details">
                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{gym.name}</h3>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#555" }}>
                      <strong>Address:</strong> {gym.address}
                    </p>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#555" }}>
                      <strong>Hours:</strong> {gym.hours}
                    </p>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#1976d2" }}>
                      <strong>
                        Distance:{" "}
                        {getDistance(
                          location.lat,
                          location.lng,
                          gym.lat,
                          gym.lng
                        ).toFixed(2)}{" "}
                        km
                      </strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
