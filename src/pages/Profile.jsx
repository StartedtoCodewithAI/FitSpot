import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import FSButton from "../components/FSButton";

const defaultProfile = {
  id: null,
  email: "",
  username: "",
  full_name: "",
  avatar_url: "",
};

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
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

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setProfile(defaultProfile);
        setAuthUser(null);
        setLoading(false);
        return;
      }
      setAuthUser(user);

      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile does not exist, create it
        const insertPayload = {
          id: user.id,
          email: user.email || "",
          username: user.user_metadata?.username || "default_username",
          full_name: user.user_metadata?.full_name || "No Name",
          avatar_url: user.user_metadata?.avatar_url || "",
        };
        const { error: insertError } = await supabase.from("profiles").insert(insertPayload);
        if (insertError) {
          console.error("Failed to create profile:", insertError);
          toast.error("Failed to create profile.");
          setLoading(false);
          return;
        }
        data = insertPayload;
      } else if (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to fetch profile.");
        setLoading(false);
        return;
      }

      setProfile({
        id: data.id,
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
      });
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
        .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
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
          filter: `sender_id=eq.${authUser.id},receiver_id=eq.${authUser.id}`,
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

    // For now, send message to yourself. Change receiver_id to other users later.
    const receiverId = authUser.id;

    const messagePayload = {
      sender_id: authUser.id,
      receiver_id: receiverId,
      content: newMsg.trim(),
    };

    const { error } = await supabase.from("messages").insert([messagePayload]);

    if (error) {
      console.error("Send message error:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } else {
      setNewMsg("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !authUser) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${authUser.id}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

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
        setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
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
      setProfile((prev) => ({ ...prev, avatar_url: null }));
      toast.success("Avatar removed!");
    } else {
      toast.error("Failed to remove avatar.");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!authUser) return <div>Please log in to view your profile.</div>;

  return (
    <div
      className="container"
      style={{
        maxWidth: 540,
        margin: "3.5rem auto",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
        padding: "2.4rem 2.1rem 1.7rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#2563eb", marginBottom: 20 }}>Your Profile</h1>

      {/* Avatar */}
      <div style={{ marginBottom: 22 }}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #2563eb",
              marginBottom: 8,
            }}
          />
        ) : (
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "#f1f5f9",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.8rem",
              fontWeight: 700,
              border: "3px solid #e0e7ef",
              marginBottom: 8,
            }}
          >
            {profile.full_name
              ? profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : profile.email
              ? profile.email[0].toUpperCase()
              : "?"}
          </div>
        )}

        <label
          htmlFor="avatar-upload"
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            padding: "0.45rem 1.1rem",
            cursor: "pointer",
            marginRight: 12,
            fontWeight: 600,
          }}
        >
          {avatarUploading ? "Uploading..." : "Change Avatar"}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarUpload}
          disabled={avatarUploading}
        />
        {profile.avatar_url && (
          <button
            onClick={handleAvatarRemove}
            style={{
              background: "transparent",
              border: "none",
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Profile details */}
      {!editMode ? (
        <>
          <h2>{profile.full_name || profile.email || "User"}</h2>
          <p style={{ color: "#64748b", marginBottom: 16 }}>{profile.email}</p>
          <p>
            <b>Username:</b> {profile.username || "-"}
          </p>

          <button
            onClick={() => setEditMode(true)}
            style={{
              marginTop: 20,
              padding: "0.5rem 1.5rem",
              background: "#2563eb",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            Edit Profile
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            style={{
              width: "100%",
              padding: "0.45rem 0.7rem",
              marginBottom: 14,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            placeholder="Username"
            style={{
              width: "100%",
              padding: "0.45rem 0.7rem",
              marginBottom: 14,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Email"
            style={{
              width: "100%",
              padding: "0.45rem 0.7rem",
              marginBottom: 14,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
            disabled
          />

          <div style={{ marginTop: 8 }}>
            <FSButton
              onClick={async () => {
                // Validate required fields
                if (!profile.full_name.trim() || !profile.username.trim()) {
                  toast.error("Full name and username are required.");
                  return;
                }

                const { error } = await supabase
                  .from("profiles")
                  .update({
                    full_name: profile.full_name.trim(),
                    username: profile.username.trim(),
                    // email can't be changed here, disabled input
                  })
                  .eq("id", authUser.id);

                if (error) {
                  console.error("Failed to update profile:", error);
                  toast.error("Failed to update profile.");
                } else {
                  toast.success("Profile updated!");
                  setEditMode(false);
                }
              }}
            >
              Save
            </FSButton>
            <FSButton
              style={{ marginLeft: 12, background: "#e11d48" }}
              onClick={() => {
                setEditMode(false);
                // Reset fields to last saved profile
                setProfile((p) => ({ ...p }));
              }}
            >
              Cancel
            </FSButton>
          </div>
        </>
      )}

      {/* Messages Section */}
      <div style={{ marginTop: 40, textAlign: "left" }}>
        <h3>Messages</h3>
        <div
          style={{
            maxHeight: 240,
            overflowY: "auto",
            background: "#f9fafb",
            borderRadius: 10,
            padding: "1rem",
            marginBottom: 12,
          }}
        >
          {messages.length === 0 && <p>No messages yet.</p>}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: "0.4rem 0.6rem",
                marginBottom: 6,
                background:
                  msg.sender_id === authUser.id ? "#dbeafe" : "#e0e0e0",
                borderRadius: 6,
                alignSelf:
                  msg.sender_id === authUser.id ? "flex-end" : "flex-start",
                maxWidth: "70%",
              }}
            >
              <small style={{ fontSize: "0.7rem", color: "#555" }}>
                {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
              </small>
              <p style={{ margin: 0 }}>{msg.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message"
            style={{
              flexGrow: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              padding: "0 1rem",
              cursor: "pointer",
              fontWeight: 600,
              border: "none",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
