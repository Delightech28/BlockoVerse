import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WaitlistForm from "./Component/WaitlistForm";
import VerifyCode from "./Component/VerifyCode";
import Dashboard from "./Component/Dashboard";
import Profile from "./Component/Profile";  // Import Profile component
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
        <Route path="/profile" element={<Profile />} />  {/* Add Profile Route */}
        <Route path="/signup" element={<WaitlistForm />} />
      </Routes>
    </Router>
  );
}

export default App;
