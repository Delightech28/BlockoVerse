
import React, { useState } from "react";
import { Link } from "react-router-dom";
//import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons
import "./NavBar.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Blockoverse
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
        >
          <i
            className={`bi ${isOpen ? "bi-x" : "bi-list"}`}
            style={{
              fontSize: "36px", /* Bigger icon */
            }}
          ></i>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tasks">Tasks</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rewards">Rewards</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/referral">Referral</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/nft">NFT</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
