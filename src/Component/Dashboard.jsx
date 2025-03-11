import React from 'react';

import { useEffect, useState } from "react"; import { db } from "../firebase"; import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; import { useNavigate } from "react-router-dom"; import Leaderboard from "./Leaderboard"; import ReferralSection from "./ReferralSection";

function Dashboard() { const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); const [points, setPoints] = useState(0); const [lastCheckIn, setLastCheckIn] = useState(null); const [countdown, setCountdown] = useState("00:00:00"); const [referralLink, setReferralLink] = useState(""); const navigate = useNavigate();

useEffect(() => { const fetchUser = async () => { const params = new URLSearchParams(window.location.search); const email = params.get("email");

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
        setPoints(userData.points || 0);
        setLastCheckIn(userData.lastCheckIn || null);
        setReferralLink(`${window.location.origin}/signup?ref=${userId}`);
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

useEffect(() => { if (lastCheckIn) { const interval = setInterval(() => { const now = new Date().getTime(); const nextCheckIn = new Date(lastCheckIn).getTime() + 24 * 60 * 60 * 1000; const diff = nextCheckIn - now;

if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setCountdown("00:00:00");
    }
  }, 1000);
  return () => clearInterval(interval);
}

}, [lastCheckIn]);

const handleCheckIn = async () => { const now = new Date().getTime(); const nextCheckIn = lastCheckIn ? new Date(lastCheckIn).getTime() + 24 * 60 * 60 * 1000 : 0;

if (now < nextCheckIn) {
  alert("You can check in again after the countdown ends.");
  return;
}

try {
  const userRef = doc(db, "users", user.id);
  await updateDoc(userRef, {
    points: points + 5,
    lastCheckIn: new Date().toISOString()
  });

  setPoints(points + 5);
  setLastCheckIn(new Date().toISOString());
  alert("Check-in successful! +5 points added.");
} catch (error) {
  console.error("Error updating check-in:", error);
}

};

if (loading) return <p>Loading...</p>;

return ( <> <div> <h2>Welcome to the Dashboard</h2> {user ? ( <div> <p><strong>Email:</strong> {user.email}</p> <p><strong>Referral Count:</strong> {user.referralCount}</p> <p><strong>Points:</strong> {points}</p> <button onClick={handleCheckIn} disabled={countdown !== "00:00:00"}> {countdown === "00:00:00" ? "Check In" : Next Check-in: ${countdown}} </button> </div> ) : ( <p>No user data found.</p> )} </div> <ReferralSection user={user} /> <Leaderboard/> </> ); }

export default Dashboard;

