import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function ReferralSection({ user }) {
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    const fetchReferralLink = async () => {
      if (user && user.id) {
        try {
          const userRef = doc(db, "users", user.id);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const refCode = userData.referralCode || "";
            setReferralLink(`${window.location.origin}/signup?ref=${refCode}`);
          }
        } catch (error) {
          console.error("Error fetching referral link:", error);
        }
      }
    };
    fetchReferralLink();
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert("Referral link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };

  return (
    <div>
      <h3>Referral Program</h3>
      {referralLink ? (
        <>
          <p>Your Referral Link:</p>
          <input type="text" value={referralLink} readOnly />
          <button onClick={copyToClipboard}>Copy Referral Link</button>
          <div>
            <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(referralLink)}`, "_blank")}>
              Share on WhatsApp
            </button>
            <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, "_blank")}>
              Share on Telegram
            </button>
            <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`, "_blank")}>
              Share on Twitter
            </button>
          </div>
        </>
      ) : (
        <p>Loading referral link...</p>
      )}
    </div>
  );
}

export default ReferralSection;
