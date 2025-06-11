import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";

// Sample gyms data...
const gyms = [
  // ... your gyms here ...
];

// ... getDistance, loadFavorites, saveFavorites as before ...

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
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search gyms by name..."
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
