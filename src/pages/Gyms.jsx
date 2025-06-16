import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SearchBar from "../components/SearchBar";
import FSButton from "../components/FSButton";

// Utility: Distance in km between two lat/lng
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

const FAVORITES_KEY = "fitspot_favorite_gyms";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in, object = logged in
  const [userLocation, setUserLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState("");
  const [radiusKm, setRadiusKm] = useState(7);
  const [favorites, setFavorites] = useState(loadFavorites());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("distance");

  // --- Enhancement: Success state if a code was just created ---
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => saveFavorites(favorites), [favorites]);

  // Route protection: check user status before doing anything else
  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData?.session?.user) {
        setUser(sessionData.session.user);
      } else {
        setUser(null);
        navigate("/login?redirect=gyms");
      }
    });
  }, [navigate]);

  // Show success after redirect from booking if location state has { codeCreated: true }
  useEffect(() => {
    if (location.state?.codeCreated) {
      setShowSuccess(true);
      // clear the state so it doesn't persist after reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Early out: if loading user status, show nothing
  if (user === undefined) return <div style={{ padding: 32 }}>Loading...</div>;

  // Geolocation
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
            throw new Error("Overpass API error");
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
          setError("Failed to fetch gyms from OpenStreetMap.");
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

  // Sorting/filtering
  function getSortedGyms(gymArray) {
    let arr = [...gymArray];
    if (sortOption === "name") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortOption === "favorites") {
      arr.sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.distance - b.distance;
      });
    } else {
      arr.sort((a, b) => a.distance - b.distance); // Closest
    }
    return arr;
  }

  const filteredGyms = gyms.filter(gym => {
    if (showOnlyFavorites && !favorites.includes(gym.id)) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    const name = gym.name?.toLowerCase() || "";
    return name.includes(term);
  });

  const displayedGyms = getSortedGyms(filteredGyms);

  // Skeleton loader for gym cards
  function GymCardSkeleton() {
    return (
      <div style={{
        flex: "0 1 320px",
        minWidth: 280,
        maxWidth: 370,
        background: "#f1f5f9",
        borderRadius: 15,
        boxShadow: "0 2px 15px #2563eb14",
        marginBottom: "0.5rem",
        height: 262,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "pulse 1.3s infinite"
      }}>
        <div style={{
          height: 110, width: "100%", background: "#e0e7ef", borderRadius: "15px 15px 0 0"
        }} />
        <div style={{ height: 20, width: "60%", background: "#e0e7ef", borderRadius: 8, margin: "15px 0 10px 16px" }} />
        <div style={{ height: 16, width: "40%", background: "#e0e7ef", borderRadius: 8, margin: "0 0 8px 16px" }} />
        <div style={{ height: 16, width: "30%", background: "#e0e7ef", borderRadius: 8, margin: "0 0 24px 16px" }} />
        <style>
          {`@keyframes pulse { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }`}
        </style>
      </div>
    );
  }

  function FavStar({ filled }) {
    return (
      <span role="img" aria-label={filled ? "Favorited" : "Not favorited"} style={{ fontSize: "1.2em" }}>
        {filled ? "⭐" : "☆"}
      </span>
    );
  }

  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "1.4rem" }}>Real Gyms Near You</h1>

      {/* --- Success Message after booking a session/code --- */}
      {showSuccess && (
        <div style={{
          background: "#e0ffe6",
          color: "#25633e",
          padding: "1.2rem 2rem",
          borderRadius: 10,
          marginBottom: 28,
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center",
          boxShadow: "0 2px 12px #22c55e18"
        }}>
          🎉 <b>Your code has been created!</b>
          <br />
          <FSButton
            style={{
              marginTop: 16,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0.82rem 2.2rem",
              fontWeight: 700,
              fontSize: "1.1rem",
              boxShadow: "0 2px 10px #2563eb25",
              cursor: "pointer"
            }}
            onClick={() => navigate("/my-codes")}
          >
            Go to My Codes
          </FSButton>
        </div>
      )}

      <div style={{ fontSize: "0.95rem", color: "#888", marginBottom: 16 }}>
        <b>Tip:</b> Searching within
        <select
          value={radiusKm}
          onChange={e => setRadiusKm(Number(e.target.value))}
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
          aria-label="Change search radius"
        >
          {[3, 5, 7, 10, 15, 20].map((km) => (
            <option key={km} value={km}>
              {km} km
            </option>
          ))}
        </select>
        radius. Change the radius if there are too few/many results.
      </div>

      {/* Fancy Search Bar */}
      <div style={{ margin: "18px 0 8px 0", maxWidth: 420 }}>
        <SearchBar
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search gyms by name..."
        />
      </div>

      {/* Sort Dropdown */}
      <div style={{
        margin: "0 0 12px 0",
        display: "flex",
        alignItems: "center"
      }}>
        <label htmlFor="sort-gyms" style={{
          fontWeight: 600,
          color: "#2563eb",
          fontSize: "1.05rem",
          marginRight: 10
        }}>
          Sort gyms:
        </label>
        <select
          id="sort-gyms"
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          style={{
            fontWeight: 600,
            color: "#2563eb",
            background: "#f1f5fd",
            border: "1px solid #2563eb44",
            borderRadius: 8,
            padding: "5px 16px 5px 8px",
            fontSize: "1.06rem",
            boxShadow: "0 2px 8px #2563eb0a",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="distance">Closest</option>
          <option value="name">Name (A-Z)</option>
          <option value="favorites">Favorites first</option>
        </select>
      </div>

      {/* Show Only Favorites Toggle */}
      <div style={{ display: "flex", alignItems: "center", margin: "14px 0" }}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontWeight: 600, color: "#2563eb", fontSize: "1.08rem" }}>
          <span style={{ marginRight: 9 }}>Show only favorites</span>
          <span style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
            <input
              type="checkbox"
              checked={showOnlyFavorites}
              onChange={() => setShowOnlyFavorites(v => !v)}
              style={{ opacity: 0, width: 0, height: 0 }}
              aria-label="Toggle show only favorites"
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
        <FSButton
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
        </FSButton>
      )}

      {loading && (
        <div style={{
          display: "flex", gap: 20, flexWrap: "wrap", marginTop: 12, marginBottom: 20
        }}>
          {[1, 2, 3].map(i => <GymCardSkeleton key={i} />)}
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
            : searchTerm
              ? "No gyms match your search."
              : `No real gyms found within ${radiusKm}km of your location.`}
          <br />
          Try a different radius or clear the filter!
        </div>
      )}

      {/* Gyms Listing */}
      {userLocation && displayedGyms.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.2rem",
          marginTop: 20,
          justifyContent: "center"
        }}>
          {displayedGyms.map((gym) => {
            const isFav = favorites.includes(gym.id);
            return (
              <div
                key={gym.id}
                tabIndex={0}
                aria-label={`Gym: ${gym.name}`}
                style={{
                  flex: "0 1 320px",
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
                  justifyContent: "space-between",
                  transition: "box-shadow .18s, transform .16s",
                  outline: "none",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 32px #2563eb33";
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 2px 15px #2563eb14";
                  e.currentTarget.style.transform = "none";
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = "0 8px 32px #38bdf866"; }}
                onBlur={e => { e.currentTarget.style.boxShadow = "0 2px 15px #2563eb14"; }}
              >
                {/* RANDOM IMAGE for now */}
                <img
                  src={`https://picsum.photos/seed/${gym.id || gym.name}/330/140`}
                  alt={`Random gym for ${gym.name}`}
                  style={{
                    width: "100%",
                    height: 110,
                    objectFit: "cover",
                    borderRadius: "12px 12px 10px 10px",
                    marginBottom: 12,
                    boxShadow: "0 2px 10px #2563eb12"
                  }}
                  loading="lazy"
                />
                <div>
                  {/* Gym Name & Favorite Star */}
                  <div style={{
                    fontWeight: 700,
                    fontSize: "1.18rem",
                    color: "#2563eb",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                  }}>
                    <FSButton
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => setFavorites((prevFavs) =>
                        prevFavs.includes(gym.id)
                          ? prevFavs.filter((f) => f !== gym.id)
                          : [...prevFavs, gym.id]
                      )}
                      aria-label={isFav ? "Unfavorite" : "Favorite"}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        marginRight: 8,
                        fontSize: "1.3rem",
                        padding: 0,
                        lineHeight: 1,
                        outline: "none"
                      }}
                    >
                      <FavStar filled={isFav} />
                    </FSButton>
                    {gym.name}
                  </div>
                  {gym.address && (
                    <div style={{ color: "#0b2546", opacity: 0.78, marginBottom: 4, display: "flex", alignItems: "center" }}>
                      📍 {gym.address}
                    </div>
                  )}
                  <div style={{ fontSize: ".93rem", color: "#38bdf8", marginBottom: 2 }}>
                    {gym.distance < 1
                      ? `${Math.round(gym.distance * 1000)} m away`
                      : `${gym.distance.toFixed(1)} km away`}
                  </div>
                  {gym.phone && (
                    <div style={{ fontSize: ".93rem", color: "#222", marginBottom: 2, display: "flex", alignItems: "center" }}>
                      📞 <a href={`tel:${gym.phone}`} style={{ color: "#2563eb", textDecoration: "underline", marginLeft: 4 }}>{gym.phone}</a>
                    </div>
                  )}
                  {gym.opening_hours && (
                    <div style={{
                      marginLeft: 2,
                      marginTop: 4,
                      padding: "2px 10px",
                      borderRadius: 14,
                      fontWeight: 600,
                      fontSize: "0.93em",
                      color: "#2563eb",
                      background: "rgba(37,99,235,0.12)",
                      border: "1.5px solid #2563eb44",
                      marginBottom: 2,
                      verticalAlign: "middle"
                    }}>
                      🕒 {gym.opening_hours}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${gym.lat}&mlon=${gym.lng}#map=18/${gym.lat}/${gym.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                      fontWeight: 600,
                      display: "flex", alignItems: "center"
                    }}
                  >OpenStreetMap <span style={{ marginLeft: 5, fontSize: 13 }}>↗️</span></a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${gym.lat},${gym.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      color: "#38bdf8",
                      textDecoration: "underline",
                      fontWeight: 600,
                      display: "flex", alignItems: "center"
                    }}
                  >Google Maps <span style={{ marginLeft: 5, fontSize: 13 }}>↗️</span></a>
                </div>
                {/* BOLD BOOK SESSION BUTTON */}
                <FSButton
                  style={{
                    background: 'linear-gradient(90deg, #38bdf8, #2563eb)',
                    color: '#fff',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: '40px',
                    padding: '1rem 2.2rem',
                    marginTop: '1.3rem',
                    boxShadow: '0 4px 16px #2563eb22',
                    cursor: 'pointer',
                    letterSpacing: '.06em',
                    transition: 'background 0.2s, transform 0.1s',
                    display: 'block',
                    width: '100%',
                    maxWidth: 270,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #38bdf8)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8, #2563eb)'}
                  onClick={() => navigate(`/book/${gym.id}`, { state: { gym } })}
                  aria-label={`Book session at ${gym.name}`}
                >
                  💪 BOOK Session
                </FSButton>
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
