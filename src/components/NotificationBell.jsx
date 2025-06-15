import React, { useState } from "react";
import notifications from "../data/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 24,
          position: "relative",
        }}
        aria-label="Show notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#dc2626",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              transform: "translate(30%, -30%)"
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
            top: "120%",
            right: 0,
            background: "#fff",
            border: "1px solid #e5e8ef",
            borderRadius: 10,
            minWidth: 220,
            boxShadow: "0 4px 24px #0002",
            zIndex: 2000,
            padding: "0.7rem 0.5rem",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ color: "#888" }}>No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "7px 0",
                  borderBottom: "1px solid #f1f1f1",
                  fontSize: 15,
                  color: "#222",
                }}
              >
                {n.text}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
