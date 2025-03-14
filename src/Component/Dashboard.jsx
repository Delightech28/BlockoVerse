import React, { useEffect, useState } from "react";  
import { db } from "../firebase";  
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";  
import { useNavigate } from "react-router-dom";  
import Leaderboard from "./Leaderboard";  
import ReferralSection from "./ReferralSection";  
import NavBar from "./NavBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './DashBoard.css'

function Dashboard() {  
  const [user, setUser] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [points, setPoints] = useState(0);  
  const [lastCheckIn, setLastCheckIn] = useState(null);  
  const [countdown, setCountdown] = useState("00:00:00");  
  const navigate = useNavigate();  

  useEffect(() => {  
    const fetchUser = async () => {  
      const params = new URLSearchParams(window.location.search);  
      const email = params.get("email") || localStorage.getItem("userEmail");  

      if (!email) {  
        toast.warning("⚠️ No email found, redirecting...", { autoClose: 3000, theme: "colored" });
        navigate("/register");  
        return;  
      }  

      try {  
        const q = query(collection(db, "users"), where("email", "==", email));  
        const querySnapshot = await getDocs(q);  

        if (!querySnapshot.empty) {  
          const userData = querySnapshot.docs[0].data();  
          const userId = querySnapshot.docs[0].id;  

          if (!userData.verified) {  
            toast.error("❌ User not verified. Redirecting...", { autoClose: 3000, theme: "colored" });
            navigate(`/verify?email=${email}`);  
          } else {  
            setUser({ ...userData, id: userId });  
            setPoints(userData.points || 0);  
            setLastCheckIn(userData.lastCheckIn || null);  
            localStorage.setItem("userEmail", email);
          }  
        } else {  
          toast.warning("⚠️ User not found, redirecting...", { autoClose: 3000, theme: "colored" });
          navigate("/register");  
        }  
      } catch (error) {  
        console.error("Error fetching user:", error);  
        toast.error("❌ Error loading user data.", { autoClose: 3000, theme: "colored" });
      } finally {  
        setLoading(false);  
      }  
    };  
    fetchUser();  
  }, [navigate]);  

  useEffect(() => {  
    if (lastCheckIn) {  
      const interval = setInterval(() => {  
        const now = new Date().getTime();  
        const nextCheckIn = new Date(lastCheckIn).getTime() + 24 * 60 * 60 * 1000;  
        const diff = nextCheckIn - now;  

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

  const handleCheckIn = async () => {  
    const now = new Date().getTime();  
    const nextCheckIn = lastCheckIn ? new Date(lastCheckIn).getTime() + 24 * 60 * 60 * 1000 : 0;  

    if (now < nextCheckIn) {  
      toast.warning("⏳ You can check in again after the countdown ends.", { autoClose: 3000, theme: "colored" });
      return;  
    }  

    try {  
      const userRef = doc(db, "users", user.id);  
      await updateDoc(userRef, {  
        points: points + 5,  
        lastCheckIn: new Date().toISOString()  
      });  

      setPoints(prevPoints => prevPoints + 5);  
      setLastCheckIn(new Date().toISOString());  
      toast.success("🎉 Check-in successful! +5 points added.", { autoClose: 3000, theme: "colored" });
    } catch (error) {  
      console.error("Error updating check-in:", error);  
      toast.error("❌ Check-in failed. Please try again.", { autoClose: 3000, theme: "colored" });
    }  
  };  

  if (loading) return <p>Loading...</p>;  

  return (  
    <>  
      <NavBar user={user} />
      <div className="dashboard-container">
        <h2>Claim & Earn Hub</h2>  
        {user ? (  
          <div className="dashboard-content">

            <p><strong>Points:</strong> <span className="points-text">{points}</span></p>  
            
            <button 
              className={`check-in-btn ${countdown === "00:00:00" ? "active" : "inactive"}`} 
              onClick={handleCheckIn} 
              disabled={countdown !== "00:00:00"}
            >  
              {countdown === "00:00:00" ? "Check In" : `Next Check-in: ${countdown}`}  
            </button>  
          </div>  
        ) : (  
          <p>No user data found.</p>  
        )}  
      </div>  
      <ReferralSection user={user} />  
      <Leaderboard/>  
      <ToastContainer />  
    </>  
  );
}  

export default Dashboard;
