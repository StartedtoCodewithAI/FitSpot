import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import FSButton from "../components/FSButton";

// ----------- Helper Functions -----------
function formatEuropeanDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getGoogleCalendarUrl({ title, description, location, startDate, endDate }) {
  const formatDate = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${end}` +
    `&details=${encodeURIComponent(description || '')}` +
    `&location=${encodeURIComponent(location || '')}` +
    `&sf=true&output=xml`;
}

function generateICS({ title, description, location, startDate, endDate }) {
  const formatICSDate = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const icsContent =
    `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
END:VEVENT
END:VCALENDAR`;
  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(icsContent);
}
// ----------------------------------------

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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setFetchError("Please log in to view your bookings.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("codes")
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
    return () => { isMounted = false; };
  }, []);

  // Split bookings into upcoming and past
  const now = new Date();
  const upcoming = [];
  const past = [];
  bookings.forEach(b => {
    if (!b.date) return past.push(b);
    const dateString = typeof b.date === "string" ? b.date : b.date.toString();
    const bDate = new Date(dateString + "T" + (b.time || "00:00"));
    if (isNaN(bDate.getTime())) return past.push(b);
    if (bDate >= now) {
      upcoming.push(b);
    } else {
      past.push(b);
    }
  });

  function renderAddToCalendar(b) {
    // Build start and end datetimes
    const startDateTime = `${b.date}T${b.time || '09:00'}`;
    // If you want to add 1 hour to time, parse and add; otherwise just use next hour
    let endDateTime;
    if (b.time) {
      const [h, m] = b.time.split(":");
      const end = new Date(`${b.date}T${b.time}`);
      end.setHours(end.getHours() + 1);
      endDateTime = end.toISOString().slice(0,16);
    } else {
      endDateTime = `${b.date}T10:00`;
    }

    const eventDetails = {
      title: `Session @ ${b.gym?.name || b.gym || "Gym"}`,
      description: `FitSpot booking code: ${b.code}`,
      location: b.gym?.name || b.gym || "",
      startDate: startDateTime,
      endDate: endDateTime
    };

    return (
      <div style={{marginTop: 6, fontSize: "0.97em"}}>
        <a
          href={getGoogleCalendarUrl(eventDetails)}
          target="_blank"
          rel="noopener noreferrer"
          style={{marginRight: 10, color: "#2563eb", fontWeight: 500, textDecoration: "underline"}}
        >
          Add to Google Calendar
        </a>
        <a
          href={generateICS(eventDetails)}
          download={`Booking-${b.code}.ics`}
          style={{ color: "#2563eb", fontWeight: 500, textDecoration: "underline"}}
        >
          Add to Apple/Outlook Calendar
        </a>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem 1rem 3rem 1rem",
        minHeight: "80vh"
      }}
    >
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
                      {b.gym?.name || b.gym || "Gym"}
                    </div>
                    <div style={{ margin: "0.35rem 0", color: "#333" }}>
                      <b>Date:</b> {formatEuropeanDate(b.date)} <b>Time:</b> {b.time || "N/A"}
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
                    {renderAddToCalendar(b)}
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
                      {b.gym?.name || b.gym || "Gym"}
                    </div>
                    <div style={{ margin: "0.35rem 0", color: "#333" }}>
                      <b>Date:</b> {formatEuropeanDate(b.date)} <b>Time:</b> {b.time || "N/A"}
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
                    {renderAddToCalendar(b)}
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
