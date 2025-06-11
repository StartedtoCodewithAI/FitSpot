import React from "react";
import "./SearchBar.css";

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="search-bar">
    <span className="search-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="7" stroke="#888" strokeWidth="2" />
        <line x1="14.4142" y1="14.9999" x2="18" y2="18.5857" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="search-input"
      autoComplete="off"
    />
  </div>
);

export default SearchBar;
