import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { supabase } from "../supabaseClient";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import FSButton from "../components/FSButton";

const localizer = momentLocalizer(moment);

// --- European date/time formats for calendar UI ---
const formats = {
  dateFormat: 'DD/MM',
  dayFormat: 'ddd DD/MM',
  weekdayFormat: 'dddd',
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd, DD MMMM YYYY',
  dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
    `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`,
  agendaHeaderFormat: ({ start, end }, culture, localizer) =>
    `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`,
  agendaDateFormat: 'DD/MM/YYYY',
  agendaTimeFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
  eventTimeRangeStartFormat: ({ start }, culture, localizer) =>
    `${moment(start).format('HH:mm')}`,
  eventTimeRangeEndFormat: ({ end }, culture, localizer) =>
    `${moment(end).format('HH:mm')}`,
  timeGutterFormat: 'HH:mm',
};

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
        setEvents(
          (data || [])
            .filter(b => b.date)
            .map(b => {
              const start = new Date(`${b.date}T${b.time || "09:00"}`);
              let end;
              if (b.time) {
                const [h, m] = b.time.split(":");
                end = new Date(`${b.date}T${b.time}`);
                end.setHours(end.getHours() + 1);
              } else {
                end = new Date(`${b.date}T10:00`);
              }
              return {
                id: b.id || b.code,
                title: `Session @ ${b.gym?.name || "Gym"}`,
                start,
                end,
                booking: b,
              };
            })
        );
      }
      setLoading(false);
    }
    fetchBookings();
  }, []);

  function eventStyleGetter(event) {
    const now = new Date();
    if (event.start < now) {
      return { style: { backgroundColor: "#cbd5e1" } };
    }
    return { style: { backgroundColor: "#2563eb", color: "#fff" } };
  }

  function onSelectEvent(event) {
    navigate("/my-codes", { state: { highlight: event.booking.code } });
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 16px #6C47FF11",
      padding: 32
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#2563eb", marginBottom: 18 }}>My Session Calendar</h2>
        <FSButton onClick={() => navigate("/my-codes")}>My Codes</FSButton>
      </div>
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
          onSelectEvent={onSelectEvent}
          formats={formats}
        />
      )}
    </div>
  );
}
