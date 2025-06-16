import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { supabase } from "../supabaseClient";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const localizer = momentLocalizer(moment);

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("codes")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        setEvents([]);
      } else {
        // Map bookings to calendar events
        setEvents(
          data
            .filter(b => b.date)
            .map(b => ({
              id: b.id || b.code,
              title: `Session @ ${b.gym?.name || "Gym"}`,
              start: new Date(`${b.date}T${b.time || "09:00"}`),
              end: new Date(`${b.date}T${b.time || "10:00"}`), // 1 hour default
              booking: b,
            }))
        );
      }
      setLoading(false);
    }
    fetchBookings();
  }, []);

  function eventStyleGetter(event) {
    // Optionally style past/future events
    const now = new Date();
    if (event.start < now) {
      return { style: { backgroundColor: "#cbd5e1" } };
    }
    return { style: { backgroundColor: "#2563eb", color: "#fff" } };
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #6C47FF11", padding: 32 }}>
      <h2 style={{ color: "#2563eb", marginBottom: 18 }}>My Session Calendar</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={event =>
            navigate(`/my-codes`, { state: { highlight: event.booking.code } })
          }
        />
      )}
    </div>
  );
}
