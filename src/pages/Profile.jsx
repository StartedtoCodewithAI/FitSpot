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

      // Fetch the authenticated user
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setAuthUser(null);  // If no user is found, set authUser to null
        setProfile(defaultProfile);  // Reset the profile
        setLoading(false);
        return;
      }

      setAuthUser(user);  // Set the authenticated user

      // Now, fetch the user's profile from the 'profiles' table
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
          name: user.user_metadata?.full_name || "",
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

    // Ensure the message is not empty and the user is logged in
    if (!newMsg.trim() || !authUser || !authUser.id) {
      toast.error("You need to be logged in to send a message.");
      return;
    }

    // Log the authUser.id for debugging
    console.log("authUser ID:", authUser.id);  // Log the ID to ensure it's correct

    // Create the message payload with the sender_id as UUID
    const payload = {
      sender_id: authUser.id,  // Ensure this is the correct logged-in user's ID (UUID)
      receiver_id: null,
      content: newMsg.trim(),
    };

    // Insert the message into the database
    const { error } = await supabase.from("messages").insert([payload]);

    if (error) {
      console.error("Send message error:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } else {
      setNewMsg("");  // Clear the input field if the message was sent successfully
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
            border: "3px solid #e0e7ef", marginBottom: 8
          }}>
            {getInitials(profile.name, profile.email)}
          </div>
        )}

        <label htmlFor="avatar-upload">
          <FSButton size="small" variant="outline" text={avatarUploading ? "Uploading..." : "Upload Avatar"} />
        </label>
        <input
          id="avatar-upload"
          type="file"
          style={{ display: "none" }}
          accept="image/*"
          disabled={avatarUploading}
          onChange={handleAvatarUpload}
        />
        <button onClick={handleAvatarRemove} disabled={avatarUploading} style={{
          backgroundColor: "#f87171", padding: "6px 12px", borderRadius: "8px", marginTop: "8px"
        }}>
          Remove Avatar
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave}>
        <div>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Full Name"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", marginBottom: 16 }}
            disabled={!editMode}
          />
        </div>

        {/* Other Profile Fields */}
        <div>
          <textarea
            name="goals"
            value={profile.goals}
            onChange={handleChange}
            placeholder="Your Goals"
            rows={3}
            disabled={!editMode}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", marginBottom: 16 }}
          />
        </div>

        {/* Target Progress */}
        <div style={{ marginBottom: 24 }}>
          <h3>Your Target: {profile.targetLabel || "N/A"}</h3>
          <h4>Progress: {profile.currentProgress}/{profile.targetTotal || 0} </h4>
          <div>{getMotivationalMsg(pct)}</div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
            placeholder="Progress Amount"
            style={{
              padding: "8px", borderRadius: "6px", flex: 1, fontSize: "1rem",
              border: "1px solid #ccc", outline: "none"
            }}
          />
          <button type="button" onClick={handleProgressAdd} style={{
            padding: "8px 16px", borderRadius: "6px", background: "#2563eb", color: "#fff"
          }}>
            Add Progress
          </button>
        </div>

        <div>
          <button type="button" onClick={handleProgressReset} style={{
            padding: "6px 12px", borderRadius: "8px", marginTop: "16px", backgroundColor: "#f87171"
          }}>
            Reset Progress
          </button>
        </div>

        <div>
          <button type="submit" style={{
            padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff", borderRadius: "8px",
            marginTop: "16px"
          }} disabled={!editMode}>
            Save Changes
          </button>
        </div>
      </form>

      {/* Messages */}
      <div style={{ marginTop: "2rem", maxHeight: 400, overflowY: "auto" }}>
        <div>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              padding: "10px", borderBottom: "1px solid #e0e7ef", marginBottom: "8px",
              textAlign: "left"
            }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{msg.sender_name}</div>
              <div>{msg.content}</div>
            </div>
          ))}
        </div>

        <div ref={messagesEndRef} />
        <div style={{ marginTop: 16 }}>
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            style={{
              padding: "8px", borderRadius: "6px", width: "100%", resize: "none",
              fontSize: "1rem"
            }}
          />
          <button type="button" onClick={handleSendMessage} style={{
            padding: "8px 16px", backgroundColor: "#2563eb", color: "#fff", borderRadius: "6px",
            marginTop: "8px"
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}
