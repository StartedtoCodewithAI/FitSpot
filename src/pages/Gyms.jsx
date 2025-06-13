import React, { useState, useEffect } from "react";

const DEFAULT_RADIUS_KM = 7;
const FAVORITES_KEY = "fitspot_favorite_gyms";

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

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export default function Gyms() {
  const [userLocation, setUserLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState("");
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [favorites, setFavorites] = useState(loadFavorites());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    if (gyms.length > 0) {
      const validFavs = favorites.filter(favId =>
        gyms.some(gym => gym.id === favId)
      );
      if (validFavs.length !== favorites.length) {
        setFavorites(validFavs);
      }
    }
    // eslint-disable-next-line
  }, [gyms]);

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

        const radiusMeters = radiusKm * 1000;
        const query = `[out:json];
          (
            node["leisure"~"fitness_centre|gym"](around:${radiusMeters},${userLoc.lat},${userLoc.lng});
            way["leisure"~"fitness_centre|gym"](around:${radiusMeters},${userLoc.lat},${userLoc.lng});
            relation["leisure"~"fitness_centre|gym"](around:${radiusMeters},${userLoc.lat},${userLoc.lng});
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
                  ? `${el.tags["addr:street"]}${el.tags["addr:housenumber"] ? " " + el.tags["addr:housenumber"] : ""}${el.tags["addr:city"] ? ", " + el.tags["addr:city"] : ""}`
                  : el.tags?.["addr:full"] || "",
              lat,
              lng,
              tags: el.tags || {},
              phone: el.tags?.phone || el.tags?.["contact:phone"] || el.tags?.["contact:mobile"] || "",
              opening_hours: el.tags?.opening_hours || "",
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

  const handleRadiusChange = (e) => {
    setRadiusKm(Number(e.target.value));
    if (userLocation) {
      handleAllowLocation();
    }
  };

  const toggleFavorite = (gymId) => {
    setFavorites((prevFavs) =>
      prevFavs.includes(gymId)
        ? prevFavs.filter((f) => f !== gymId)
        : [...prevFavs, gymId]
    );
  };

  // Sort gyms: favorites first, then by distance.
  const sortedGyms = [...gyms].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.distance - b.distance;
  });

  // Filter based on showOnlyFavorites toggle
  const displayedGyms = showOnlyFavorites
    ? sortedGyms.filter(gym => favorites.includes(gym.id))
    : sortedGyms;

  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "1.4rem" }}>Real Gyms Near You</h1>

      <div style={{ fontSize: "0.95rem", color: "#888", marginBottom: 16 }}>
        <b>Tip:</b> Searching within
        <select
          value={radiusKm}
          onChange={handleRadiusChange}
          style={{
            fontWeight: 700,
            color: "#2563eb",
            border: "1px solid #2563eb44",
            borderRadius: 6,
            marginLeft: 8,
            marginRight: 6,
            padding: "2px 8px",
            background: "#f1f5fd",
          }}
        >
          {[3, 5, 7, 10, 15, 20].map((km) => (
            <option key={km} value={km}>
              {km} km
            </option>
          ))}
        </select>
        radius. Change the radius if there are too few/many results.
      </div>

      {/* Fancy Show Only Favorites Toggle */}
      <div style={{ display: "flex", alignItems: "center", margin: "14px 0" }}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontWeight: 600, color: "#2563eb", fontSize: "1.08rem" }}>
          <span style={{ marginRight: 9 }}>Show only favorites</span>
          <span style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
            <input
              type="checkbox"
              checked={showOnlyFavorites}
              onChange={() => setShowOnlyFavorites(v => !v)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: "absolute",
              cursor: "pointer",
              top: 0, left: 0,
              width: "44px", height: "24px",
              background: showOnlyFavorites ? "#2563eb" : "#e5e7eb",
              borderRadius: "16px",
              transition: "background 0.2s",
              boxShadow: showOnlyFavorites ? "0 0 4px #2563eb99" : undefined
            }}>
            </span>
            <span style={{
              position: "absolute",
              left: showOnlyFavorites ? "22px" : "2px",
              top: "2px",
              width: "20px", height: "20px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 2px 6px #0001",
              transition: "left 0.2s"
            }}></span>
          </span>
        </label>
      </div>

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

      {userLocation && displayedGyms.length === 0 && !loading && !error && (
        <div style={{ color: "#2563eb" }}>
          {showOnlyFavorites
            ? "You have no favorite gyms in this area."
            : `No real gyms found within ${radiusKm}km of your location.`}
          <br />
          Try a different radius or clear the filter!
        </div>
      )}

      {userLocation && displayedGyms.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.2rem",
          marginTop: 20,
        }}>
          {displayedGyms.map((gym) => {
            const isFav = favorites.includes(gym.id);
            return (
              <div key={gym.id} style={{
                flex: "1 0 320px",
                minWidth: 280,
                maxWidth: 370,
                background: isFav ? "rgba(255,215,0,0.14)" : "rgba(37,99,235,0.08)",
                border: isFav ? "2px solid gold" : "1px solid #2563eb22",
                borderRadius: 15,
                boxShadow: "0 2px 15px #2563eb14",
                padding: "1.3rem 1.3rem 1.1rem 1.3rem",
                marginBottom: "0.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: "1.18rem",
                    color: "#2563eb",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                  }}>
                    <button
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => toggleFavorite(gym.id)}
                      aria-label={isFav ? "Unfavorite" : "Favorite"}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        marginRight: 8,
                        fontSize: "1.4rem",
                        color: isFav ? "#FFD700" : "#bbb",
                        transition: "color 0.2s",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {isFav ? "★" : "☆"}
                    </button>
                    {gym.name}
                  </div>
                  {gym.address && (
                    <div style={{ color: "#0b2546", opacity: 0.78, marginBottom: 4 }}>
                      {gym.address}
                    </div>
                  )}
                  <div style={{ fontSize: ".93rem", color: "#38bdf8", marginBottom: 2 }}>
                    {gym.distance.toFixed(2)} km away
                  </div>
                  {gym.phone && (
                    <div style={{ fontSize: ".93rem", color: "#222", marginBottom: 2 }}>
                      📞 <a href={`tel:${gym.phone}`} style={{ color: "#2563eb", textDecoration: "underline" }}>{gym.phone}</a>
                    </div>
                  )}
                  {gym.opening_hours && (
                    <div style={{ fontSize: ".93rem", color: "#444", marginBottom: 2 }}>
                      🕒 <span>{gym.opening_hours}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 7 }}>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${gym.lat}&mlon=${gym.lng}#map=18/${gym.lat}/${gym.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >OpenStreetMap</a>
                  {" "}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${gym.lat},${gym.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      color: "#38bdf8",
                      textDecoration: "underline",
                      fontWeight: 600,
                      marginLeft: 12
                    }}
                  >Google Maps</a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: "0.85rem", marginTop: 30, color: "#888" }}>
        Data from <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors.
      </div>
    </div>
  );
}
