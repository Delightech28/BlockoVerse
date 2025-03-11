import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserEmail = "current_user@example.com"; // Replace with actual logged-in user's email

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);

        let usersData = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            email: userData.email,
            referralCount: userData.referralCount || 0,
            referralCode: userData.referralCode || "",
          });
        });

        // Sort users by referral count in descending order
        usersData.sort((a, b) => b.referralCount - a.referralCount);
        setTopUsers(usersData.slice(0, 10)); // Show only top 10

        // Fetch referrals history for the current user
        const currentUser = usersData.find((user) => user.email === currentUserEmail);
        if (currentUser?.referralCode) {
          fetchReferralHistory(currentUser.referralCode);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Fetch users who signed up using the current user's referral link
  const fetchReferralHistory = async (referralCode) => {
    try {
      const refQuery = query(collection(db, "users"), where("referredBy", "==", referralCode));
      const refSnapshot = await getDocs(refQuery);

      let history = [];
      refSnapshot.forEach((doc) => {
        const refUser = doc.data();
        history.push({
          email: refUser.email,
          joinedAt: refUser.joinedAt?.toDate().toLocaleDateString() || "Unknown",
        });
      });

      setReferralHistory(history);
    } catch (error) {
      console.error("Error fetching referral history:", error);
    }
  };

  const maskEmail = (email) => {
    if (!email) return "Unknown";
    const [name, domain] = email.split("@");
    return name.slice(0, 3) + "****@" + domain;
  };

  if (loading) return <p>Loading leaderboard...</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🏆 Top Referrers</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Rank</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Referrals</th>
          </tr>
        </thead>
        <tbody>
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f1f1" }}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{index + 1}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{maskEmail(user.email)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.referralCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: "10px", border: "1px solid #ddd" }}>
                No referrals yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>📜 Referral History</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#28a745", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          {referralHistory.length > 0 ? (
            referralHistory.map((referral, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f1f1" }}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{maskEmail(referral.email)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{referral.joinedAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ padding: "10px", border: "1px solid #ddd" }}>
                No referrals found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
