
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Profile.css';
function Profile() {
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      alert("No email found, redirecting...");
      navigate("/register");
    }
  }, [email, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail"); // Clear stored email
    navigate("/register"); // Redirect to register page
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {email ? (
        <>
          <p><strong>Email:</strong> {email}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>No user data found.</p>
      )}
    </div>
  );
}

export default Profile;

