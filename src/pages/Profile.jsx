import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import FSButton from "../components/FSButton";

const defaultProfile = {
  name: "",
  email: "",
  goals: "",
  targetLabel: "",
  targetTotal: "",
  currentProgress: 0,
  progressLog: [],
  avatar_url: "",
};

const MOTIVATION = [
  { pct: 0, msg: "Let's get started! Every step counts." },
  { pct: 25, msg: "You're making progress! Keep it up!" },
  { pct: 50, msg: "Halfway there! Stay strong!" },
  { pct: 75, msg: "Almost at your target. Finish strong!" },
  { pct: 100, msg: "Congratulations! Target achieved! 🎉" },
];

function getMotivationalMsg(pct) {
  if (pct >= 100) return MOTIVATION[4].msg;
  if (pct >= 75) return MOTIVATION[3].msg;
  if (pct >= 50) return MOTIVATION[2].msg;
  if (pct >= 25) return MOTIVATION[1].msg;
  return MOTIVATION[0].msg;
}

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
}

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function getUserProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      if (!user) {
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(prev => ({
          ...prev,
          ...data,
          email: user.email,
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          name: user.user_metadata?.name || "", // Simplified from full_name to name
          email: user.email,
        }));
      }
      setLoading(false);
    }

    getUserProfile();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }
      setMessages(data);
    }

    fetchMessages();

    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !authUser) return;

    const payload = {
      sender_id: authUser.id,
      receiver_id: null,
      content: newMsg.trim(),
    };

    const { error } = await supabase.from("messages").insert([payload]);
    if (error) {
      console.error("Send message error:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } else {
      setNewMsg("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    if (!authUser) return;

    const { error } = await supabase.from("profiles").upsert({
      id: authUser.id,
      ...profile,
      email: authUser.email,
    });

    if (error) {
      toast.error("Failed to update profile.");
      console.error("Profile update error:", error);
    } else {
      toast.success("Profile updated!");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !authUser) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${authUser.id}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase
      .storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed.");
      setAvatarUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    if (data?.publicUrl) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", authUser.id);

      if (updateError) {
        toast.error("Failed to update avatar.");
      } else {
        setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
        toast.success("Avatar updated!");
      }
    }

    setAvatarUploading(false);
  }

  async function handleAvatarRemove() {
    if (!authUser) return;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", authUser.id);

    if (!error) {
      setProfile(prev => ({ ...prev, avatar_url: null }));
      toast.success("Avatar removed!");
    } else {
      toast.error("Failed to remove avatar.");
    }
  }

  const targetTotalNum = Number(profile.targetTotal) || 0;
  const pct = targetTotalNum
    ? Math.min(100, Math.round((profile.currentProgress / targetTotalNum) * 100))
    : 0;

  const handleProgressAdd = e => {
    e.preventDefault();
    const addNum = Number(progressInput);
    if (!addNum || addNum <= 0) return;

    setProfile(prev => ({
      ...prev,
      currentProgress: prev.currentProgress + addNum,
      progressLog: [...(prev.progressLog || []), {
        date: new Date().toISOString(),
        amount: addNum
      }]
    }));

    setProgressInput("");
  };

  const handleProgressReset = () => {
    if (window.confirm("Reset progress for this target?")) {
      setProfile(prev => ({
        ...prev,
        currentProgress: 0,
        progressLog: [],
      }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authUser) return <div>Please log in to view your profile.</div>;

  return (
    <div className="container" style={{
      maxWidth: 540, margin: "3.5rem auto", background: "#fff", borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.09)", padding: "2.4rem 2.1rem 1.7rem",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#2563eb", marginBottom: 20 }}>Your Profile</h1>

      {/* Avatar */}
      <div style={{ marginBottom: 22 }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" style={{
            width: 130, height: 130, borderRadius: "50%", objectFit: "cover",
            border: "3px solid #2563eb", marginBottom: 8
          }} />
        ) : (
          <div style={{
            width: 130, height: 130, borderRadius: "50%", background: "#f1f5f9",
            color: "#64748b", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "2.8rem", fontWeight: 700,
            marginBottom: 8
          }}>
            {getInitials(profile.name, profile.email)}
          </div>
        )}

        <div>
          <label className="fs-btn" style={{
            cursor: "pointer", padding: "6px 16px", fontSize: "14px", fontWeight: 600
          }}>
            {avatarUploading ? "Uploading..." : "Upload Avatar"}
            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
          </label>
          {profile.avatar_url && (
            <button onClick={handleAvatarRemove} style={{
              border: "none", backgroundColor: "transparent", color: "#e11d48", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer"
            }}>
              Remove Avatar
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile */}
      {editMode ? (
        <form onSubmit={handleSave}>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", marginBottom: "12px" }}
          />
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            style={{
              width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", marginBottom: "12px", background: "#f1f5f9"
            }}
          />
          <textarea
            name="goals"
            value={profile.goals}
            onChange={handleChange}
            placeholder="Your Goals"
            style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", marginBottom: "12px", minHeight: "80px" }}
          />
          <div className="progress">
            <label>Current Progress</label>
            <input
              type="number"
              name="currentProgress"
              value={profile.currentProgress || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", marginBottom: "12px" }}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label>Target</label>
            <input
              type="number"
              name="targetTotal"
              value={profile.targetTotal || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", marginBottom: "12px" }}
            />
          </div>

          <FSButton type="submit" variant="primary" size="medium" label="Save" />
        </form>
      ) : (
        <div>
          <h2 style={{ marginTop: 24 }}>{profile.name}</h2>
          <div style={{ fontWeight: 600, color: "#4b5563" }}>{profile.email}</div>

          {/* Progress */}
          <div style={{
            marginTop: 24, padding: "1.3rem", backgroundColor: "#f3f4f6", borderRadius: 12
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", marginBottom: 10
            }}>
              <span style={{ fontWeight: 600 }}>Progress</span>
              <span style={{ fontWeight: 600 }}>{`${profile.currentProgress}/${profile.targetTotal}`}</span>
            </div>
            <div className="progress-bar" style={{
              height: 8, borderRadius: 20, backgroundColor: "#e5e7eb", overflow: "hidden"
            }}>
              <div
                className="progress" style={{
                  width: `${pct}%`, backgroundColor: "#2563eb", height: "100%", borderRadius: "inherit"
                }}></div>
            </div>

            <div style={{
              fontSize: "0.875rem", color: "#4b5563", fontWeight: 500, marginTop: 10
            }}>
              {getMotivationalMsg(pct)}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setEditMode(true)}
            style={{
              backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px 24px",
              fontSize: "16px", borderRadius: 8, marginTop: 24, cursor: "pointer"
            }}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
