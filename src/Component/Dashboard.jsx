import React from 'react';
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ReferralSection from "./ReferralSection";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(5); // Default to 5 BV for daily check-in
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");
      if (!email) {
        alert("No email found, redirecting...");
        navigate("/");
        return;
      }
      try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const userId = querySnapshot.docs[0].id;
          if (!userData.verified) {
            alert("User not verified. Redirecting...");
            navigate("/verify?email=" + email);
          } else {
            setUser({ ...userData, id: userId });
            setPoints(userData.points || 5);
            setLastCheckIn(userData.lastCheckIn || null);
          }
        } else {
          alert("User not found, redirecting...");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        points: points + 5,
        lastCheckIn: new Date().toISOString()
      });
      setPoints(points + 5);
      setLastCheckIn(new Date().toISOString());
      alert("Check-in successful! +5 BV added.");
    } catch (error) {
      console.error("Error updating check-in:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <Sidebar /> {/* Left sidebar for PC */}
      <div className="main-dashboard">
        <h2>Welcome, {user?.email}</h2>
        <p><strong>Points:</strong> {points} BV</p>
        <button onClick={handleCheckIn}>Check In (+5 BV)</button>
        <ReferralSection user={user} />
      </div>
    </div>
  );
}

export default Dashboard;
