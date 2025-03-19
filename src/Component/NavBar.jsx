import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // Import user icon
import "./NavBar.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");

  useEffect(() => {
    const handleStorageChange = () => {
      setEmail(localStorage.getItem("userEmail") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          DefiNexus
        </Link>
        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
          <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`} style={{ fontSize: "36px" }}></i>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
            <Link className="nav-link" to="/dashboard" onClick={closeMenu}>Home</Link>

            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/TaskSubmission" onClick={closeMenu}>Tasks</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rewards" onClick={closeMenu}>Rewards</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/referral" onClick={closeMenu}>Referral</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/nft" onClick={closeMenu}>NFT</Link>
            </li>
           
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
