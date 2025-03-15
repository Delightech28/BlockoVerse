import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { FaRegCopy } from "react-icons/fa"; // Copy icon
import { FaWhatsapp, FaTelegramPlane, FaTwitter } from "react-icons/fa"; // Social Icons
import { ToastContainer, toast } from "react-toastify"; // Toast notifications
import "react-toastify/dist/ReactToastify.css"; // Toast styles
import "./ReferralSection.css";

function ReferralSection({ user }) {
  const [referralLink, setReferralLink] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  const shareText = `🌐 BlockoVerse – Unlock the Future of Web3! 🚀

Step into a world of decentralized finance, exclusive rewards, and limitless opportunities. Earn free $BVERSE, collect rare NFTs, and be part of a thriving Web3 ecosystem.

✅ Seamless & secure transactions
✅ Exclusive early rewards for members
✅ A dynamic community shaping the future

🔗 Join now and claim your spot! ${referralLink}`;

  useEffect(() => {
    const fetchReferralData = async () => {
      if (user && user.id) {
        try {
          const userRef = doc(db, "users", user.id);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setReferralCount(userData.referralCount || 0);
            setReferralLink(`${window.location.origin}/signup?ref=${userData.referralCode || ""}`);
          }
        } catch (error) {
          console.error("Error fetching referral data:", error);
        }
      }
    };

    fetchReferralData();
  }, [user]);

  const handleReferralSignup = async (referrerId) => {
    try {
      const referrerRef = doc(db, "users", referrerId);
  
      // ✅ Update referrer's referral count and add 25 points
      await updateDoc(referrerRef, {
        referralCount: increment(1),
        points: increment(25), 
      });
  
      // ✅ Fetch updated data to reflect changes in the UI
      const updatedReferrerSnap = await getDoc(referrerRef);
      const updatedReferrerData = updatedReferrerSnap.data();
      
      // ✅ Update state so UI updates instantly
      setReferralCount(updatedReferrerData.referralCount);
    } catch (error) {
      console.error("Error updating referrer points:", error);
    }
  };
  

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
      .then(() => {
        toast.success("Referral link copied to clipboard!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link. Try again!");
      });
  };

  return (
    <div className="referral-container">
      <ToastContainer /> {/* Toast container for notifications */}
      <h3>Referral Program</h3>
      {user && <p><strong>Referral Count:</strong> {referralCount}</p>}
      {referralLink ? (
        <>
          <p>Your Referral Link:</p>
          <div className="referral-input-container">
            <input type="text" className="referral-input" value={referralLink} readOnly />
            <FaRegCopy className="copy-icon" onClick={copyToClipboard} />
          </div>

          <div className="referral-buttons">
            <button
              onClick={() =>
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
                  "_blank"
                )
              }
              className="share-btn"
            >
              <FaWhatsapp size={20} color="#25D366" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
                  "_blank"
                )
              }
              className="share-btn"
            >
              <FaTelegramPlane size={20} color="#0088cc" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
                  "_blank"
                )
              }
              className="share-btn"
            >
              <FaTwitter size={20} color="#1DA1F2" />
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
