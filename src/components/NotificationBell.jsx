import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiBell } from "react-icons/fi";
import { supabase } from "../supabaseClient"; // Make sure this path is correct for your project
import { useSession } from "@supabase/auth-helpers-react"; // Or your auth/session method

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef();
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [notifications, setNotifications] = useState([]);
  const session = useSession(); // Get authenticated user

  // Fetch notifications from Supabase
  useEffect(() => {
    if (!session?.user) return;
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!error) setNotifications(data || []);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [session]);

  // Calculate position for dropdown when open
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.max(rect.right - 250, 8),
        minWidth: 250,
        background: "#fff",
        boxShadow: "0 8px 32px #2223",
        borderRadius: 12,
        padding: 10,
        zIndex: 100000,
        animation: "fadeIn .15s"
      });
    }
  }, [open]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        !document.getElementById("notification-dropdown")?.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Dropdown as portal for stacking context safety
  const dropdown = open
    ? ReactDOM.createPortal(
        <div id="notification-dropdown" style={dropdownStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ color: "#888", fontSize: 14 }}>No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "7px 0",
                  borderBottom: "1px solid #f1f1f1",
                  fontSize: 15,
                  color: "#222",
                  opacity: n.read ? 0.5 : 1
                }}
              >
                {n.text}
                <div style={{ fontSize: 11, color: "#888" }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px);}
                to { opacity: 1; transform: translateY(0);}
              }
              #notification-dropdown {
                animation: fadeIn .15s;
              }
            `}
          </style>
        </div>,
        document.body
      )
    : null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "#f3f6ff",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          boxShadow: "0 1px 8px #2563eb14",
          transition: "background 0.2s"
        }}
        aria-label="Show notifications"
      >
        <FiBell size={22} color="#222" />
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 7,
              background: "#dc2626",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: "50%",
              width: 17,
              height: 17,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              boxShadow: "0 1px 6px #dc262644"
            }}
          >
            {notifications.length}
          </span>
        )}
      </button>
      {dropdown}
    </div>
  );
}
