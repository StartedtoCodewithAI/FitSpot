import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SearchBar from "../components/SearchBar";
import toast, { Toaster } from "react-hot-toast";
import FSButton from "../components/FSButton"; // <-- Add this import

// Helper: format date to "YYYY-MM-DD"
function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "";
}

// Helper: status label
function getStatusLabel(session) {
  if (!session.date) return "";
  const today = new Date();
  const sessionDate = new Date(session.date);
  today.setHours(0, 0, 0, 0);
  sessionDate.setHours(0, 0, 0, 0);
  if (sessionDate.getTime() > today.getTime()) return "Upcoming";
  if (sessionDate.getTime() === today.getTime()) return "Today";
  return "Past";
}

// Custom confirmation modal
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(30,41,59,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 120
      }}
      onClick={onCancel}
    >
      <div style={{
        background: "#fff", borderRadius: 12, padding: "2rem 2.2rem",
        minWidth: 320, maxWidth: "90vw", boxShadow: "0 6px 30px #2563eb29", position: "relative"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: "1.08rem" }}>{message}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <FSButton
            onClick={onConfirm}
            style={{
              background: "#22c55e", color: "#fff", border: "none",
              borderRadius: 7, padding: "0.5rem 1.1rem", fontWeight: 700, fontSize: ".97rem", cursor: "pointer"
            }}
          >Yes</FSButton>
          <FSButton
            onClick={onCancel}
            style={{
              background: "#e0e7ef", color: "#2563eb", border: "none",
              borderRadius: 7, padding: "0.5rem 1.1rem", fontWeight: 700, fontSize: ".97rem", cursor: "pointer"
            }}
          >Cancel</FSButton>
        </div>
      </div>
    </div>
  );
}

export default function MyCodes() {
  // ... unchanged code until SessionModal below

  // ...all code unchanged...

  function SessionModal({ session, onClose }) {
    if (!session) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(30,41,59,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99,
        }}
        onClick={onClose}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "2rem 2.2rem",
            minWidth: 320,
            maxWidth: "90vw",
            boxShadow: "0 6px 30px #2563eb29",
            position: "relative"
          }}
          onClick={e => e.stopPropagation()}
        >
          <FSButton
            onClick={onClose}
            aria-label="Close session details"
            style={{
              position: "absolute", top: 14, right: 18,
              background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer"
            }}
          >×</FSButton>
          <h2 style={{ color: "#2563eb" }}>Session Details</h2>
          <div style={{ margin: "1.1rem 0" }}>
            <div><strong>Code:</strong> <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{session.code}</span></div>
            <div><strong>Gym:</strong> {session.gym?.name}</div>
            <div><strong>Date:</strong> {formatDate(session.date)}</div>
            <div><strong>Time:</strong> {session.time}</div>
            <div><strong>Status:</strong> {getStatusLabel(session)}</div>
            <div><strong>Used:</strong> {session.used ? "Yes" : "No"}</div>
            {session.gym?.lat && session.gym?.lng && (
              <div style={{ marginTop: 10 }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${session.gym.lat},${session.gym.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                    fontWeight: 600
                  }}
                >Get directions</a>
              </div>
            )}
          </div>
          <FSButton
            onClick={() => { handleCopy(session.code); }}
            style={{
              background: "#e0e7ef",
              color: "#2563eb",
              border: "none",
              borderRadius: 7,
              padding: "0.5rem 1.1rem",
              fontWeight: 700,
              fontSize: ".97rem",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Copy Code
          </FSButton>
          {!session.used && (
            <FSButton
              onClick={() => { openConfirm("markAsUsed", session.code); onClose(); }}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "0.5rem 1.1rem",
                fontWeight: 700,
                fontSize: ".97rem",
                cursor: "pointer"
              }}
              disabled={actionLoading === session.code}
              aria-disabled={actionLoading === session.code}
            >
              {actionLoading === session.code ? "Processing..." : "Mark as Used"}
            </FSButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1rem", position: "relative" }}>
      <Toaster />
      <h1 style={{ textAlign: "center", color: "#2563eb", marginBottom: 18 }}>My Session Codes</h1>
      <FSButton
        onClick={exportToCSV}
        style={{
          marginBottom: 16,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: "1rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          float: "right"
        }}
        aria-label="Export session codes as CSV"
      >
        Export as CSV
      </FSButton>
      <div style={{ clear: "both" }} />

      {/* ...streak section and tabs... */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <FSButton
          style={{
            flex: 1,
            padding: "0.7rem 0",
            background: activeTab === "active" ? "#2563eb" : "#f1f5f9",
            color: activeTab === "active" ? "#fff" : "#2563eb",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background 0.16s"
          }}
          onClick={() => setActiveTab("active")}
          aria-label="Show active session codes"
        >Active</FSButton>
        <FSButton
          style={{
            flex: 1,
            padding: "0.7rem 0",
            background: activeTab === "used" ? "#2563eb" : "#f1f5f9",
            color: activeTab === "used" ? "#fff" : "#2563eb",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background 0.16s"
          }}
          onClick={() => setActiveTab("used")}
          aria-label="Show used session codes"
        >Used</FSButton>
      </div>

      {/* ...unchanged SearchBar and error message... */}

      {/* Active Codes */}
      {activeTab === "active" && (
        filteredActive.length === 0 ? (
          <div style={{
            padding: "2rem",
            borderRadius: 12,
            background: "#f1f5f9",
            textAlign: "center",
            color: "#64748b",
            marginTop: 28
          }}>
            No active codes found.
          </div>
        ) : (
          <div>
            {filteredActive.map(b => (
              <div key={b.code} style={{
                background: "#fff",
                border: "1px solid #e0e7ef",
                borderRadius: 10,
                padding: "1.2rem 1rem 1.2rem 1.5rem",
                marginBottom: 18,
                boxShadow: "0 2px 10px #2563eb10",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
              }}>
                {/* ...unchanged session code and info... */}
                <div style={{ display: "flex", gap: 8 }}>
                  <FSButton
                    onClick={() => handleCopy(b.code)}
                    style={{
                      background: "#e0e7ef",
                      color: "#2563eb",
                      border: "none",
                      borderRadius: 7,
                      padding: "0.5rem 1rem",
                      fontWeight: 700,
                      fontSize: ".97rem",
                      cursor: "pointer"
                    }}
                    aria-label={`Copy code ${b.code}`}
                    disabled={actionLoading === b.code}
                  >
                    {copiedCode === b.code ? "Copied!" : "Copy"}
                  </FSButton>
                  <FSButton
                    onClick={() => openConfirm("markAsUsed", b.code)}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: 7,
                      padding: "0.5rem 1.1rem",
                      fontWeight: 700,
                      fontSize: ".97rem",
                      cursor: "pointer"
                    }}
                    disabled={actionLoading === b.code}
                    aria-disabled={actionLoading === b.code}
                  >
                    {actionLoading === b.code ? "Processing..." : "Mark as Used"}
                  </FSButton>
                  <FSButton
                    onClick={() => openConfirm("delete", b.code)}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: 7,
                      padding: "0.5rem 1.1rem",
                      fontWeight: 700,
                      fontSize: ".97rem",
                      cursor: "pointer"
                    }}
                    disabled={actionLoading === b.code}
                    aria-disabled={actionLoading === b.code}
                  >
                    {actionLoading === b.code ? "Processing..." : "Delete"}
                  </FSButton>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Used Codes */}
      {activeTab === "used" && (
        filteredUsed.length === 0 ? (
          <div style={{
            padding: "2rem",
            borderRadius: 12,
            background: "#f1f5f9",
            textAlign: "center",
            color: "#64748b",
            marginTop: 28
          }}>
            No used codes found.
          </div>
        ) : (
          <div>
            {filteredUsed.map(b => (
              <div key={b.code} style={{
                background: "#fff",
                border: "1px solid #e0e7ef",
                borderRadius: 10,
                padding: "1.2rem 1rem 1.2rem 1.5rem",
                marginBottom: 18,
                boxShadow: "0 2px 10px #2563eb10",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: 0.7,
                flexWrap: "wrap"
              }}>
                {/* ...unchanged session code and info... */}
                <FSButton
                  onClick={() => handleCopy(b.code)}
                  style={{
                    background: "#e0e7ef",
                    color: "#2563eb",
                    border: "none",
                    borderRadius: 7,
                    padding: "0.5rem 1rem",
                    fontWeight: 700,
                    fontSize: ".97rem",
                    cursor: "pointer"
                  }}
                  aria-label={`Copy code ${b.code}`}
                >
                  {copiedCode === b.code ? "Copied!" : "Copy"}
                </FSButton>
              </div>
            ))}
          </div>
        )
      )}

      {/* Session details modal */}
      {showModal && <SessionModal session={modalSession} onClose={closeModal} />}

      {/* Global confirmation modal */}
      <ConfirmModal
        open={confirmModal.open}
        message={
          confirmModal.type === "delete"
            ? "Are you sure you want to delete this code?"
            : confirmModal.type === "markAsUsed"
            ? "Mark this session as used?"
            : ""
        }
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
