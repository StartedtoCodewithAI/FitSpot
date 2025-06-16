import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import FSButton from "../components/FSButton";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchBookings() {
      setLoading(true);
      setFetchError("");
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setFetchError("Please log in to view your bookings.");
        setLoading(false);
        return;
      }

      // Fetch bookings for this user from sessions, no join, just select *
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        setFetchError("Failed to fetch bookings: " + error.message);
      } else if (isMounted) {
        setBookings(data || []);
      }
      setLoading(false);
    }

    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Split bookings into upcoming and past
  const now = new Date();
  const upcoming = [];
  const past = [];
  bookings.forEach(b => {
    const bDate = new Date(b.date + "T" + (b.time || "00:00"));
    if (bDate >= now) {
      upcoming.push(b);
    } else {
      past.push(b);
    }
  });

  return (
    <div style={{
      maxWidth: 700,
      margin: "0 auto",
      padding: "2.5rem 1rem 3rem 1rem",
      minHeight: "80vh"
    }}>
      <h2 style={{
        fontSize: "2rem",
        fontWeight: 800,
        textAlign: "center",
        marginBottom: "2.4rem",
        color: "#2563eb"
      }}>
        My Bookings
      </h2>

      {loading && (
        <div style={{ textAlign: "center", margin: "3rem 0", color: "#444" }}>
          Loading your bookings...
        </div>
      )}

      {fetchError && (
        <div style={{ textAlign: "center", color: "#dc2626", margin: "2rem 0" }}>
          {fetchError}
          <br />
          <FSButton
            className="cta"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/login")}
          >
            Login
          </FSButton>
        </div>
      )}

      {!loading && !fetchError && (
        <>
          <section style={{ marginBottom: "3rem" }}>
            <h3 style={{ color: "#2563eb", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>
              Upcoming Bookings
            </h3>
            {upcoming.length === 0 ? (
              <p style={{ color: "#888", marginBottom: 0 }}>No upcoming bookings.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {upcoming.map((b, i) => (
                  <li key={b.id || i} style={{
                    background: "#f1f5f9",
                    borderRadius: 12,
                    padding: "1.2rem 1.3rem",
                    marginBottom: 18,
                    boxShadow: "0 2px 8px #2563eb13"
                  }}>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>
                      {b.gym || "Gym"}
                    </div>
                    <div style={{ margin: "0.35rem 0", color: "#333" }}>
                      <b>Date:</b> {b.date} <b>Time:</b> {b.time || "N/A"}
                    </div>
                    <div style={{ color: "#888" }}>
                      <b>Status:</b> {b.used ? "Checked In" : "Booked"}
                    </div>
                    <div style={{ color: "#888" }}>
                      <b>Code:</b> <span style={{
                        background: "#dbeafe",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontWeight: 600,
                        letterSpacing: "2px",
                        color: "#2563eb"
                      }}>{b.code}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 style={{ color: "#2563eb", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>
              Past Bookings
            </h3>
            {past.length === 0 ? (
              <p style={{ color: "#888", marginBottom: 0 }}>No past bookings yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {past.map((b, i) => (
                  <li key={b.id || i} style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "1.2rem 1.3rem",
                    marginBottom: 18,
                    boxShadow: "0 2px 8px #2563eb13"
                  }}>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>
                      {b.gym || "Gym"}
                    </div>
                    <div style={{ margin: "0.35rem 0", color: "#333" }}>
                      <b>Date:</b> {b.date} <b>Time:</b> {b.time || "N/A"}
                    </div>
                    <div style={{ color: "#888" }}>
                      <b>Status:</b> {b.used ? "Checked In" : "Missed"}
                    </div>
                    <div style={{ color: "#888" }}>
                      <b>Code:</b> <span style={{
                        background: "#dbeafe",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontWeight: 600,
                        letterSpacing: "2px",
                        color: "#2563eb"
                      }}>{b.code}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
