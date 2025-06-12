// src/components/SearchBar.jsx
import React from "react";

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "0.8rem 1.2rem",
        borderRadius: 10,
        border: "1px solid #e0e7ef",
        fontSize: "1rem",
        boxSizing: "border-box"
      }}
    />
  );
}
