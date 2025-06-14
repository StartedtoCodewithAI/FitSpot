import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookSession from './pages/BookSession';
import MyCodes from './pages/MyCodes';

// Optional: Prevents scroll-stuck on route change (improves mobile feel)
function ScrollToTop() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [window.location.hash]);
  return null;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <ScrollToTop />
      <main
        style={{
          minHeight: "calc(100vh - 72px)", // Prevents content hiding behind navbar
          background: "#f8fafc",
          paddingTop: 0,
          paddingBottom: "2rem",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gyms" element={<Gyms />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book-session" element={<BookSession />} />
          <Route path="/book/:gymId" element={<BookSession />} />  {/* <-- Add this line */}
          <Route path="/my-codes" element={<MyCodes />} />
        </Routes>
      </main>
    </Router>
  );
}
