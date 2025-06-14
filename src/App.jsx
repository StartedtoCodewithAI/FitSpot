import React from "react";
import { HashRouter as Router } from "react-router-dom";
import Navbar from './components/Navbar';

export default function App() {
  return (
    <Router>
      <Navbar />
      <div>It works!</div>
    </Router>
  );
}
