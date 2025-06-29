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
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUser(user);

        // Debug log to check user ID
        console.log("Authenticated user ID:", user ? user.id : "No user");

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
            name: user.user_metadata?.full_name || "",
            email: user.email,
          }));
        }

        // Verify if user exists in the 'users' table (foreign key check)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError || !userData) {
          console.error("User record not found in users table:", userError);
          toast.error("User record not found in users table.");
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Something went wrong while fetching the profile.");
        setLoading(false);
      }
    }

    getUserProfile();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading messages:", error);
          return;
        }
        setMessages(data);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
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

    if (!newMsg.trim() || !authUser || !authUser.id) {
      toast.error("User not authenticated or invalid message.");
      return;
    }

    const payload = {
      sender_id: authUser.id,
      receiver_id: null, // You can modify this if you have a receiver ID
      content: newMsg.trim(),
    };

    try {
      const { error } = await supabase.from("messages").insert([payload]);
      if (error) {
        console.error("Send message error:", error);
        toast.error(`Failed to send message: ${error.message}`);
      } else {
        setNewMsg("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    if (!authUser) return;

    try {
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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile.");
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

    try {
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
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error uploading avatar.");
    }

    setAvatarUploading(false);
  }

  async function handleAvatarRemove() {
    if (!authUser) return;
    try {
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
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Error removing avatar.");
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{profile.name || "Profile"}</h5>
        <p className="card-text">{profile.email}</p>

        <div className="d-flex align-items-center mb-3">
          <div className="avatar">
            <img
              src={profile.avatar_url || `https://www.gravatar.com/avatar/${md5(profile.email?.toLowerCase().trim())}`}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: 100, height: 100 }}
            />
          </div>
          <div className="ml-3">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleAvatarRemove}
              disabled={avatarUploading}
            >
              {avatarUploading ? "Removing..." : "Remove Avatar"}
            </button>
            <input
              type="file"
              className="form-control-file mt-2"
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
          </div>
        </div>

        {editMode ? (
          <div>
            <div className="mb-3">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="goals">Goals</label>
              <input
                type="text"
                className="form-control"
                name="goals"
                value={profile.goals}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="targetTotal">Target Total</label>
              <input
                type="number"
                className="form-control"
                name="targetTotal"
                value={profile.targetTotal}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="currentProgress">Current Progress</label>
              <input
                type="number"
                className="form-control"
                name="currentProgress"
                value={profile.currentProgress}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleSave} className="btn btn-primary">Save</button>
          </div>
        ) : (
          <div>
            <p>{getMotivationalMsg(progressInput)}</p>
            <div className="progress" style={{ height: "20px" }}>
              <div
                className="progress-bar"
                style={{ width: `${progressInput}%` }}
                role="progressbar"
              >
                {progressInput}%
              </div>
            </div>
            <button onClick={() => setEditMode(true)} className="btn btn-secondary mt-2">
              Edit Profile
            </button>
          </div>
        )}

        <div className="mt-4">
          <h5>Messages</h5>
          <div className="mb-3">
            <textarea
              className="form-control"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Type your message..."
              rows={3}
            />
          </div>
          <FSButton onClick={handleSendMessage} disabled={avatarUploading}>
            Send Message
          </FSButton>
          <div className="messages">
            {messages.map(msg => (
              <div key={msg.id} className="message">
                <p>{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
