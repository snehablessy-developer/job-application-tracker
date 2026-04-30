import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

const inp = { width:"100%", padding:"10px 12px", border:"0.5px solid #E2DDD4", borderRadius:"8px", background:"#F5F3EE", fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#1A1814", outline:"none", boxSizing:"border-box", marginTop:"6px" };
const lbl = { fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px", color:"#7A7568" };

export default function Register() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [loading,setLoading]=useState(false);
  const { register } = useAuth(); const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email||!password||!confirm) { toast.error("Please fill in all fields."); return; }
    if (password.length<6) { toast.error("Password must be at least 6 characters."); return; }
    if (password!==confirm) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try { await register(email,password); navigate("/"); toast.success("Account created! Welcome 🎉"); }
    catch(err) { toast.error(getAuthErrorMessage(err.code)); }
    finally { setLoading(false); }
  }
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#F5F3EE",padding:"20px"}}>
      <div style={{background:"#fff",padding:"40px",borderRadius:"14px",width:"100%",maxWidth:"400px",border:"0.5px solid #E2DDD4"}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"26px",fontWeight:"400",marginBottom:"6px",color:"#1A1814"}}>Create account ✨</h2>
        <p style={{fontSize:"13px",color:"#7A7568",marginBottom:"28px"}}>Start tracking your job applications</p>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:"16px"}}><label style={lbl}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="sneha@gmail.com" style={inp} /></div>
          <div style={{marginBottom:"16px"}}><label style={lbl}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" style={inp} /></div>
          <div style={{marginBottom:"24px"}}><label style={lbl}>Confirm Password</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••" style={inp} /></div>
          <button type="submit" disabled={loading} style={{width:"100%",padding:"11px",background:"#1A1814",color:"#fff",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer",opacity:loading?0.7:1}}>{loading?"Creating…":"Create Account"}</button>
        </form>
        <p style={{textAlign:"center",marginTop:"16px",fontSize:"13px",color:"#7A7568"}}>Already have an account? <Link to="/login" style={{color:"#2D5BE3",fontWeight:"500"}}>Sign In</Link></p>
      </div>
    </div>
  );
}