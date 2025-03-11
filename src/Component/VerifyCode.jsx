import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function VerifyCode() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userEmail = params.get("email");
    if (userEmail) {
      setEmail(decodeURIComponent(userEmail));
    }
  }, []);

  const handleVerify = async () => {
    console.log("Checking email:", email);

    if (!email) {
      alert("Email is missing. Try again.");
      return;
    }

    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    console.log("Query Snapshot Size:", querySnapshot.size);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      console.log("User data from Firestore:", userData);

      // ✅ Convert both to numbers before comparison
      if (Number(userData.verificationCode) === Number(code)) {
        await updateDoc(userDoc.ref, { verified: true });
        alert("✅ Verification successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate(`/dashboard?email=${email}`);
        }, 2000);
      } else {
        alert("Invalid code. Try again.");
      }
    } else {
      alert("Email not found. Try again.");
    }
  };

  return (
    <div>
      <h2>Enter Verification Code</h2>
      {email && <p>Email found: <strong>{email}</strong></p>}
      <input
        type="text"
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
}

export default VerifyCode;
