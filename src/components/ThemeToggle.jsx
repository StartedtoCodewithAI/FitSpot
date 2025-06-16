import React, { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      style={{
        background: dark ? "#222" : "#f3f6ff",
        border: "none",
        borderRadius: "50%",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 22,
        marginLeft: 12,
        boxShadow: dark ? "0 1px 8px #2223" : "0 1px 8px #2563eb14",
        transition: "background 0.2s"
      }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <FiSun color="#ffd93b" size={22} />
      ) : (
        <FiMoon color="#222" size={22} />
      )}
    </button>
  );
}
