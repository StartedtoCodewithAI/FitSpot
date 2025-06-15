import React from "react";
import "./FSButton.css";

export default function FSButton({
  children,
  variant = "primary", // "primary", "secondary", "danger"
  className = "",
  style = {},
  ...props
}) {
  return (
    <button
      className={`fs-btn fs-btn-${variant} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
