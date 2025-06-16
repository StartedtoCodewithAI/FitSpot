import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SearchBar from "../components/SearchBar";
import toast, { Toaster } from "react-hot-toast";
import FSButton from "../components/FSButton";

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
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(""); // which code is acting
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [maxStreak, setMaxStreak] = useState(0);
  const [copiedCode, setCopiedCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalSession, setModalSession] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, code: null });

  // Fetch codes from Supabase
  useEffect(() => {
    setLoading(true);
    async function fetchUserAndCodes() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User not found");
        setUserId(user.id);
        setUserName(user.email || user.name || "");
        // Fetch codes from Supabase (filtered to this user)
        const { data, error } = await supabase
          .from("codes")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });
        if (error) throw error;
        setCodes(data);

        // Streak logic
        const sorted = (data || [])
          .filter(b => b.date)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        let streak = 1, maxStreakVal = 1;
        for (let i = 1; i < sorted.length; ++i) {
          const prev = new Date(sorted[i - 1].date);
          const curr = new Date(sorted[i].date);
          const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
            streak++;
            maxStreakVal = Math.max(maxStreakVal, streak);
          } else {
            streak = 1;
          }
        }
        setMaxStreak(maxStreakVal);
      } catch (e) {
        setError("Failed to load codes. " + e.message);
      }
      setLoading(false);
    }
    fetchUserAndCodes();
    // eslint-disable-next-line
  }, []);

  // Reload codes after update/delete
  const refetchCodes = async () => {
    setLoading(true);
    setError("");
    if (!userId) return;
    const { data, error } = await supabase
      .from("codes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (error) setError("Failed to reload codes: " + error.message);
    else setCodes(data);
    setLoading(false);
  };

  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(""), 1400);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  if (loading) {
    return <div style={{textAlign:"center",marginTop:40}}>Loading...</div>;
  }
  if (!userName) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Please log in to see your codes.
      </div>
    );
  }

  // --- Action handlers using custom modal and toasts ---
  function openConfirm(type, code) {
    setConfirmModal({ open: true, type, code });
  }
  function closeConfirm() {
    setConfirmModal({ open: false, type: null, code: null });
  }
  async function handleConfirm() {
    if (confirmModal.type === "delete") await handleDelete(confirmModal.code);
    if (confirmModal.type === "markAsUsed") await handleMarkAsUsed(confirmModal.code);
    closeConfirm();
  }

  async function handleDelete(code) {
    setActionLoading(code);
    const { error } = await supabase
      .from("codes")
      .delete()
      .eq("code", code)
      .eq("user_id", userId);
    setActionLoading("");
    if (error) {
      setError("Failed to delete code: " + error.message);
      toast.error("Failed to delete code.");
    } else {
      toast.success("Code deleted!");
      refetchCodes();
    }
  }

  function handleCopy(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied!");
  }

  function exportToCSV() {
    const header = "Code,Gym,Date,Time,Used\n";
    const rows = codes.map(b =>
      [b.code, b.gym?.name, b.date, b.time, b.used ? "Yes" : "No"].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_fitspot_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV!");
  }

  async function handleMarkAsUsed(code) {
    setActionLoading(code);
    const { error } = await supabase
      .from("codes")
      .update({ used: true })
      .eq("code", code)
      .eq("user_id", userId);
    setActionLoading("");
    if (error) {
      setError("Failed to mark code as used: " + error.message);
      toast.error("Failed to mark as used.");
    } else {
      toast.success("Session marked as used!");
      refetchCodes();
    }
  }

  function openModal(session) {
    setModalSession(session);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setModalSession(null);
  }

  const lowerSearch = search.toLowerCase();
  const filteredActive = codes.filter(
    b =>
      !b.used &&
      (!lowerSearch ||
        b.gym?.name?.toLowerCase().includes(lowerSearch) ||
        b.code?.toLowerCase().includes(lowerSearch))
  );
  const filteredUsed = codes.filter(
    b =>
      b.used &&
      (!lowerSearch ||
        b.gym?.name?.toLowerCase().includes(lowerSearch) ||
        b.code?.toLowerCase().includes(lowerSearch))
  );

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

      <div style={{
        background: "#f1f5f9",
        borderRadius: 12,
        padding: "18px 16px",
        margin: "0 0 24px 0",
        color: "#2563eb",
        fontWeight: 600,
        fontSize: "1.09rem",
        textAlign: "center"
      }}>
        <span style={{ fontSize: "1.5rem" }}>🔥</span>
        {maxStreak > 1
          ? <>You’re on a <span style={{ color: "#2563eb" }}>{maxStreak}-day streak</span>! Keep it up, {userName}!</>
          : <>No streak yet – book those sessions and start your fitness journey!</>
        }
      </div>

      {/* Tabs */}
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

      {/* Fancy Search Bar */}
      <SearchBar
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by gym name or code"
      />

      {error && (
        <div style={{
          color: "#dc2626",
          background: "#fee2e2",
          padding: "1rem",
          borderRadius: 8,
          marginBottom: 20,
          textAlign: "center"
        }} role="alert">
          {error}
        </div>
      )}

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
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.45rem",
                    color: "#2563eb",
                    letterSpacing: ".16em",
                    background: "#f1f5f9",
                    padding: "8px 18px",
                    borderRadius: 12,
                    marginRight: 18,
                    cursor: "pointer"
                  }}
                  tabIndex={0}
                  aria-label="View session details"
                  onClick={() => openModal(b)}
                  onKeyPress={e => { if (e.key === "Enter") openModal(b); }}
                  title="Click for details"
                >
                  {b.code}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700 }}>{b.gym?.name}</div>
                  <div style={{ color: "#64748b", fontSize: ".97rem" }}>
                    {formatDate(b.date)} &middot; {b.time}
                    <span style={{
                      marginLeft: 10,
                      padding: "2px 10px",
                      background: "#f1f5f9",
                      borderRadius: 8,
                      fontSize: ".92rem",
                      color: "#2563eb"
                    }}>
                      {getStatusLabel(b)}
                    </span>
                  </div>
                  {b.gym?.lat && b.gym?.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${b.gym.lat},${b.gym.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        color: "#2563eb",
                        fontWeight: 600,
                        textDecoration: "underline"
                      }}
                    >
                      Get directions
                    </a>
                  )}
                </div>
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
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.45rem",
                    color: "#64748b",
                    letterSpacing: ".16em",
                    background: "#f1f5f9",
                    padding: "8px 18px",
                    borderRadius: 12,
                    marginRight: 18,
                    cursor: "pointer"
                  }}
                  tabIndex={0}
                  aria-label="View session details"
                  onClick={() => openModal(b)}
                  onKeyPress={e => { if (e.key === "Enter") openModal(b); }}
                  title="Click for details"
                >
                  {b.code}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700 }}>{b.gym?.name}</div>
                  <div style={{ color: "#64748b", fontSize: ".97rem" }}>
                    {formatDate(b.date)} &middot; {b.time}
                    <span style={{
                      marginLeft: 10,
                      padding: "2px 10px",
                      background: "#f1f5f9",
                      borderRadius: 8,
                      fontSize: ".92rem",
                      color: "#2563eb"
                    }}>
                      {getStatusLabel(b)}
                    </span>
                  </div>
                  {b.gym?.lat && b.gym?.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${b.gym.lat},${b.gym.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        color: "#2563eb",
                        fontWeight: 600,
                        textDecoration: "underline"
                      }}
                    >
                      Get directions
                    </a>
                  )}
                </div>
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
