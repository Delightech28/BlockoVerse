import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import "./VerifyCode.css"; 

function VerifyCode() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userEmail = params.get("email");
    if (userEmail) {
      setEmail(decodeURIComponent(userEmail));
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only digits
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.error("❌ Please enter a 6-digit verification code.");
      return;
    }

    if (!email) {
      toast.error("❌ Email is missing. Try again.");
      return;
    }

    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (Number(userData.verificationCode) === Number(fullCode)) {
        await updateDoc(userDoc.ref, { verified: true });
        toast.success("✅ Verification successful! Redirecting...");
        setTimeout(() => {
          navigate(`/dashboard?email=${email}`);
        }, 2000);
      } else {
        toast.error("❌ Invalid code. Try again.");
      }
    } else {
      toast.error("❌ Email not found. Try again.");
    }
  };

  return (
    <div className="verify-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="verify-box">
        <h2>Verify Your Code</h2>
        {email && <p className="email-text">Code sent to: <strong>{email}</strong></p>}
        <div className="code-input-container">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="code-input"
            />
          ))}
        </div>
        <button className="verify-btn" onClick={handleVerify}>Verify</button>
      </div>
    </div>
  );
}

export default VerifyCode;
