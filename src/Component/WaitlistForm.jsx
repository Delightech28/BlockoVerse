import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, updateDoc } from "firebase/firestore";
import emailjs from "emailjs-com";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WaitlistsForm.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const sendVerificationEmail = (userEmail, verificationCode) => {
  emailjs
    .send(
      "service_0lhshzb",
      "template_uuo7oj9",
      {
        user_email: userEmail,
        verification_code: verificationCode,
      },
      "xbyQZEcbAdxv2VNRC"
    )
    .then((response) => {
      console.log("Email sent successfully:", response);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
};

const hashEmail = (email) => {
  const [name, domain] = email.split("@");
  return name.slice(0, 3) + "****@" + domain;
};

const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [referrerEmail, setReferrerEmail] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        setError("You are already registered! Redirecting to dashboard...");
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
      });

      sendVerificationEmail(email, verificationCode);

      if (referrerEmail) {
        const referrerQuery = query(usersRef, where("email", "==", referrerEmail));
        const referrerSnapshot = await getDocs(referrerQuery);
        if (!referrerSnapshot.empty) {
          const referrerDoc = referrerSnapshot.docs[0];
          await updateDoc(referrerDoc.ref, {
            referralCount: referrerDoc.data().referralCount + 1,
          });
        }
      }

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
      setError("An error occurred. Please try again.");
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
        <h2 className="text-center mb-4">🚀 Join the Web3 Waitlist</h2>
        {referrerEmail && <p className="text-light">You're signing up with referral from: {hashEmail(referrerEmail)}</p>}
        {/* {error && <p className="text-danger text-center">{error}</p>} */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input 
              type="email" 
              name="email" 
              className="form-control input-glow" 
              placeholder="Enter your email" 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-glow w-100">Join the Waitlist</button>
        </form>
      </div>

      {/* Toast Container (Needed for displaying toast notifications) */}
      <ToastContainer />
    </div>
  );
};

export default WaitlistForm;
