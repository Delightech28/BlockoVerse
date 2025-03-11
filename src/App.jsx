import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WaitlistForm from "./Component/WaitlistForm";
import VerifyCode from "./Component/VerifyCode";
import Dashboard from "./Component/Dashboard";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<WaitlistForm />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<WaitlistForm />} /> {/* ✅ Use WaitlistForm for /signup */}
      </Routes>
    </Router>
  );
}

export default App;
