import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import emailjs from "emailjs-com";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WaitlistsForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Generate a unique referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Send verification email
const sendVerificationEmail = (userEmail, verificationCode) => {
  emailjs
    .send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        user_email: userEmail,
        verification_code: verificationCode,
      },
      import.meta.env.VITE_EMAILJS_USER_ID
    )
    .then((response) => {
      console.log("Email sent successfully:", response);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
};

// Mask referrer email
const hashEmail = (email) => {
  const [name, domain] = email.split("@");
  return name.slice(0, 3) + "****@" + domain;
};

const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [referrerEmail, setReferrerEmail] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  // Detect logged-in user and auto-fill email
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        localStorage.setItem("userEmail", user.email);
      }
    });
  }, []);

  // Fetch referrer if referral code exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode) {
      const fetchReferrer = async () => {
        const usersRef = collection(db, "users");
        const refQuery = query(usersRef, where("referralCode", "==", refCode));
        const refSnapshot = await getDocs(refQuery);

        if (!refSnapshot.empty) {
          const referrerData = refSnapshot.docs[0].data();
          setReferrerEmail(referrerData.email);
        }
      };
      fetchReferrer();
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warning("⚠️ Please enter a valid email address!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        toast.warning("⚠️ You are already registered! Redirecting to dashboard...", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });

        setTimeout(() => {
          navigate(`/dashboard?email=${encodeURIComponent(email)}`);
        }, 2000);
        return;
      }

      const userReferralCode = generateReferralCode();
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      await addDoc(usersRef, {
        email: email,
        referralCode: userReferralCode,
        referredBy: referrerEmail ? hashEmail(referrerEmail) : null,
        referralCount: 0,
        verificationCode: verificationCode,
        verified: false,
        points: 0,
      });

      sendVerificationEmail(email, verificationCode);

      toast.success("🎉 Success! You have joined the waitlist. Check your email for verification.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      setTimeout(() => {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("❌ An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="waitlist-container d-flex justify-content-center align-items-center vh-100">
      <div className="waitlist-card p-4">
        <h2 className="text-center mb-4">Join Now & Unlock Exclusive Rewards</h2>
        {referrerEmail && <p className="text-light">You're signing up with referral from: {hashEmail(referrerEmail)}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control input-glow"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={email !== ""} // Prevents manual input if auto-filled
            />
          </div>
          <button type="submit" className="waitlist-button btn btn-glow w-100">Join the Waitlist</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default WaitlistForm;
