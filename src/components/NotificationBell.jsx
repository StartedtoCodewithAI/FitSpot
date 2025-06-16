import React, { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import notifications from "../data/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button
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
      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            minWidth: 250,
            background: "#fff",
            boxShadow: "0 8px 32px #2223",
            borderRadius: 12,
            padding: 10,
            zIndex: 10000,
            animation: "fadeIn .15s"
          }}
        >
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
              </div>
            ))
          )}
        </div>
      )}
      {/* Optional: keyframes for fadeIn animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
