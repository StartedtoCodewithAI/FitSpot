import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    // Check localStorage or system preference
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
      onClick={() => setDark(d => !d)}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 22,
        marginLeft: 12
      }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "🌙" : "🌞"}
    </button>
  );
}
