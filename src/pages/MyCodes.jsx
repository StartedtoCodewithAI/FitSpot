import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import FSButton from "../components/FSButton";

// Format date as "YYYY-MM-DD"
function formatDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "";
  }
}

// Status label for a code
function getStatusLabel(code) {
  if (!code.date) return "";
  const today = new Date();
  const codeDate = new Date(code.date);
  today.setHours(0, 0, 0, 0);
  codeDate.setHours(0, 0, 0, 0);
  if (codeDate > today) return "Upcoming";
  if (codeDate.getTime() === today.getTime()) return "Today";
  return "Past";
}

// Confirmation modal
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

// Code details modal
function CodeModal({ code, onClose, handleCopy, handleMarkAsUsed, actionLoading }) {
  if (!code) return null;
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
          aria-label="Close code details"
          style={{
            position: "absolute", top: 14, right: 18,
            background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer"
          }}
        >×</FSButton>
        <h2 style={{ color: "#2563eb" }}>Code Details</h2>
        <div style={{ margin: "1.1rem 0" }}>
          <div><strong>Code:</strong> <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{code.code || "N/A"}</span></div>
          <div><strong>Gym:</strong> {code.gym || "Unknown Gym"}</div>
          <div><strong>Date:</strong> {formatDate(code.date) || "No Date"}</div>
          <div><strong>Time:</strong> {code.time || "No Time"}</div>
          <div><strong>Status:</strong> {getStatusLabel(code)}</div>
          <div><strong>Used:</strong> {code.used ? "Yes" : "No"}</div>
        </div>
        <FSButton
          onClick={() => { handleCopy(code.code); }}
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
        {!code.used && (
          <FSButton
            onClick={() => { handleMarkAsUsed(code.code); onClose(); }}
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
            disabled={actionLoading === code.code}
            aria-disabled={actionLoading === code.code}
          >
            {actionLoading === code.code ? "Processing..." : "Mark as Used"}
          </FSButton>
        )}
      </div>
    </div>
  );
}

export default function MyCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [copiedCode, setCopiedCode] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalCode, setModalCode] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, code: null });
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch codes for the current user only
  useEffect(() => {
    async function fetchCodes() {
      setLoading(true);
      setErrorMsg("");
      // Get user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userError || !userId) {
        setErrorMsg("You must be logged in to view your codes.");
        setCodes([]);
        setLoading(false);
        return;
      }
      // Fetch only this user's codes
      const { data, error } = await supabase
        .from("codes")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        setErrorMsg("Failed to fetch codes. Please try again later.");
        setCodes([]);
      } else {
        setCodes(data || []);
      }
      setLoading(false);
    }
    fetchCodes();
  }, []);

  // Filtering
  const filteredActive = codes.filter(b => !b.used);
  const filteredUsed = codes.filter(b => b.used);

  // Copy code
  function handleCopy(code) {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(null), 1500);
  }

  // Confirmation modal
  function openConfirm(type, code) {
    setConfirmModal({ open: true, type, code });
  }
  function closeConfirm() {
    setConfirmModal({ open: false, type: null, code: null });
  }

  // Handle actions
  async function handleConfirm() {
    const { type, code } = confirmModal;
    setActionLoading(code);
    if (type === "delete") {
      const { error } = await supabase.from("codes").delete().eq("code", code);
      if (!error) {
        setCodes(codes => codes.filter(b => b.code !== code));
        toast.success("Deleted!");
      } else {
        toast.error("Failed to delete.");
      }
    }
    if (type === "markAsUsed") {
      const { error } = await supabase.from("codes").update({ used: true }).eq("code", code);
      if (!error) {
        setCodes(codes => codes.map(b => b.code === code ? { ...b, used: true } : b));
        toast.success("Marked as used!");
      } else {
        toast.error("Failed to update.");
      }
    }
    setActionLoading(null);
    closeConfirm();
  }

  // Modal handlers
  function openModal(codeObj) {
    setModalCode(codeObj);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setModalCode(null);
  }

  // Export to CSV
  function exportToCSV() {
    const header = "Code,Gym,Date,Time,Status,Used\n";
    const rows = codes.map(b =>
      [b.code, b.gym || "", formatDate(b.date), b.time || "", getStatusLabel(b), b.used ? "Yes" : "No"].join(",")
    ).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Helper for the modal to mark as used
  const handleMarkAsUsed = async (code) => {
    openConfirm("markAsUsed", code);
  };

  // START OF RENDER RETURN (stop here for first half)
