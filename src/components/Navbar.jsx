import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    try { await logout(); navigate("/login"); toast.success("Logged out!"); }
    catch { toast.error("Failed to log out."); }
  }
  return (
    <nav style={{ background:"#fff", borderBottom:"0.5px solid #E2DDD4", padding:"0 24px", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
      <span style={{ fontFamily:"'DM Serif Display', serif", fontSize:"20px", color:"#1A1814" }}>JobsAI Tracker</span>
      <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
        <span style={{ fontSize:"13px", color:"#7A7568" }}>{currentUser?.email}</span>
        <button onClick={handleLogout} style={{ background:"none", border:"0.5px solid #E2DDD4", borderRadius:"8px", padding:"6px 14px", fontSize:"13px", cursor:"pointer", color:"#7A7568" }}>Logout</button>
      </div>
    </nav>
  );
}