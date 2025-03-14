import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./Leaderboard.css"; // Ensure this file contains necessary styling

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
    <div className="leaderboard-container">
      <h2 className="text-primary">🏆 Top Referrers</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th>Rank</th>
              <th>Email</th>
              <th>Referrals</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{maskEmail(user.email)}</td>
                  <td>{user.referralCount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No referrals yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-success mt-4">📜 Referral History</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-success">
            <tr>
              <th>Email</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {referralHistory.length > 0 ? (
              referralHistory.map((referral, index) => (
                <tr key={index}>
                  <td>{maskEmail(referral.email)}</td>
                  <td>{referral.joinedAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No referrals found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;
