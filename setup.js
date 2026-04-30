const fs = require('fs');
const path = require('path');

const files = {
  'src/index.css': `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; background: #F5F3EE; color: #1A1814; }
button, input, select, textarea { font-family: 'DM Sans', sans-serif; }
a { text-decoration: none; }`,

  'src/main.jsx': `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JobsAI Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

  'src/firebase/config.js': `import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);`,

  '.env': `VITE_FIREBASE_API_KEY=AIzaSyDNXYstQPHhURBnC7amNmAzWGhNElq-_R4
VITE_FIREBASE_AUTH_DOMAIN=jobsai-tracker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobsai-tracker
VITE_FIREBASE_STORAGE_BUCKET=jobsai-tracker.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=152668662512
VITE_FIREBASE_APP_ID=1:152668662512:web:b4498ef5983ff4a734b035`,

  'src/utils/helpers.js': `export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const STATUS_COLORS = {
  Applied:   { bg: "#EEF2FD", text: "#1A3DA8", border: "#C5D3F8" },
  Interview: { bg: "#FFF4E0", text: "#7A4A00", border: "#FAD07A" },
  Offer:     { bg: "#E6F5EE", text: "#0B5C32", border: "#7DD3A8" },
  Rejected:  { bg: "#FEF0F0", text: "#8B1A1A", border: "#F5AAAA" },
};

export const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

export function getAuthErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };
  return messages[code] || "Something went wrong. Please try again.";
}`,

  'src/context/AuthContext.jsx': `import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function register(email, password) { return createUserWithEmailAndPassword(auth, email, password); }
  function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
  function logout() { return signOut(auth); }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { setCurrentUser(user); setLoading(false); });
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ currentUser, register, login, logout }}>{!loading && children}</AuthContext.Provider>;
}`,

  'src/hooks/useJobs.js': `import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export function useJobs() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "users", currentUser.uid, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  async function addJob(data) {
    await addDoc(collection(db, "users", currentUser.uid, "jobs"), { ...data, createdAt: serverTimestamp() });
  }
  async function updateJob(id, data) {
    await updateDoc(doc(db, "users", currentUser.uid, "jobs", id), data);
  }
  async function deleteJob(id) {
    await deleteDoc(doc(db, "users", currentUser.uid, "jobs", id));
  }
  async function uploadResume(jobId, file) {
    const r = ref(storage, \`resumes/\${currentUser.uid}/\${jobId}/\${file.name}\`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await updateJob(jobId, { resumeUrl: url });
    return url;
  }

  return { jobs, loading, addJob, updateJob, deleteJob, uploadResume };
}`,

  'src/components/ProtectedRoute.jsx': `import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}`,

  'src/components/StatusBadge.jsx': `import { STATUS_COLORS } from "../utils/helpers";
export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Applied"];
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:"600", background:c.bg, color:c.text, border:\`0.5px solid \${c.border}\` }}>
      {status}
    </span>
  );
}`,

  'src/components/StatsCard.jsx': `export default function StatsCard({ label, count, color, bg }) {
  return (
    <div style={{ background:bg, border:"0.5px solid #E2DDD4", borderRadius:"14px", padding:"16px 20px", flex:1, minWidth:"120px" }}>
      <div style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px", color:"#7A7568", marginBottom:"8px" }}>{label}</div>
      <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:"28px", color }}>{count}</div>
    </div>
  );
}`,

  'src/components/Navbar.jsx': `import { useNavigate } from "react-router-dom";
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
}`,

  'src/components/JobForm.jsx': `import { useState } from "react";
import { STATUSES } from "../utils/helpers";

const inp = { width:"100%", padding:"9px 12px", border:"0.5px solid #E2DDD4", borderRadius:"8px", background:"#F5F3EE", fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#1A1814", outline:"none", boxSizing:"border-box", marginTop:"6px" };
const lbl = { fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px", color:"#7A7568" };

export default function JobForm({ initial={}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ company:initial.company||"", role:initial.role||"", status:initial.status||"Applied", dateApplied:initial.dateApplied||new Date().toISOString().split("T")[0], notes:initial.notes||"" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.company.trim()) e.company = "Company name is required.";
    if (!form.role.trim()) e.role = "Job role is required.";
    if (!form.dateApplied) e.dateApplied = "Date is required.";
    return e;
  }

  function handleChange(e) { setForm({...form,[e.target.name]:e.target.value}); setErrors({...errors,[e.target.name]:""}); }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      {[{name:"company",label:"Company Name",type:"text",ph:"e.g. Google"},{name:"role",label:"Job Role",type:"text",ph:"e.g. Frontend Developer"},{name:"dateApplied",label:"Date Applied",type:"date"}].map(({name,label,type,ph})=>(
        <div key={name} style={{marginBottom:"14px"}}>
          <label style={lbl}>{label}</label>
          <input name={name} type={type} placeholder={ph} value={form[name]} onChange={handleChange} style={{...inp,borderColor:errors[name]?"#e66":"#E2DDD4"}} />
          {errors[name] && <div style={{fontSize:"11px",color:"#c44",marginTop:"4px"}}>{errors[name]}</div>}
        </div>
      ))}
      <div style={{marginBottom:"14px"}}>
        <label style={lbl}>Status</label>
        <select name="status" value={form.status} onChange={handleChange} style={inp}>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{marginBottom:"14px"}}>
        <label style={lbl}>Notes (optional)</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any extra details…" rows={3} style={{...inp,resize:"vertical"}} />
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"flex-end",marginTop:"20px"}}>
        <button type="button" onClick={onCancel} style={{background:"none",border:"0.5px solid #E2DDD4",borderRadius:"8px",padding:"8px 16px",fontSize:"13px",cursor:"pointer",color:"#7A7568"}}>Cancel</button>
        <button type="submit" disabled={loading} style={{background:"#1A1814",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 20px",fontSize:"13px",fontWeight:"500",cursor:"pointer",opacity:loading?0.7:1}}>{loading?"Saving…":"Save"}</button>
      </div>
    </form>
  );
}`,

  'src/pages/Login.jsx': `import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

const inp = { width:"100%", padding:"10px 12px", border:"0.5px solid #E2DDD4", borderRadius:"8px", background:"#F5F3EE", fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#1A1814", outline:"none", boxSizing:"border-box", marginTop:"6px" };
const lbl = { fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px", color:"#7A7568" };

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [loading,setLoading]=useState(false);
  const { login } = useAuth(); const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email||!password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try { await login(email,password); navigate("/"); toast.success("Welcome back!"); }
    catch(err) { toast.error(getAuthErrorMessage(err.code)); }
    finally { setLoading(false); }
  }
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#F5F3EE",padding:"20px"}}>
      <div style={{background:"#fff",padding:"40px",borderRadius:"14px",width:"100%",maxWidth:"400px",border:"0.5px solid #E2DDD4"}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"26px",fontWeight:"400",marginBottom:"6px",color:"#1A1814"}}>Welcome back 👋</h2>
        <p style={{fontSize:"13px",color:"#7A7568",marginBottom:"28px"}}>Sign in to your JobsAI Tracker</p>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:"16px"}}><label style={lbl}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="sneha@gmail.com" style={inp} /></div>
          <div style={{marginBottom:"24px"}}><label style={lbl}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} /></div>
          <button type="submit" disabled={loading} style={{width:"100%",padding:"11px",background:"#1A1814",color:"#fff",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer",opacity:loading?0.7:1}}>{loading?"Signing in…":"Sign In"}</button>
        </form>
        <p style={{textAlign:"center",marginTop:"16px",fontSize:"13px",color:"#7A7568"}}>Don't have an account? <Link to="/register" style={{color:"#2D5BE3",fontWeight:"500"}}>Register</Link></p>
      </div>
    </div>
  );
}`,

  'src/pages/Register.jsx': `import { useState } from "react";
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
}`,

  'src/pages/Dashboard.jsx': `import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import { STATUSES, STATUS_COLORS, formatDate } from "../utils/helpers";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import StatsCard from "../components/StatsCard";
import JobForm from "../components/JobForm";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { jobs, loading, addJob, updateJob, deleteJob, uploadResume } = useJobs();
  const [filter,setFilter]=useState("All"); const [search,setSearch]=useState("");
  const [showModal,setShowModal]=useState(false); const [editJob,setEditJob]=useState(null);
  const [deleteTarget,setDeleteTarget]=useState(null); const [saving,setSaving]=useState(false);

  const filtered = jobs.filter(j=>{
    const mf = filter==="All"||j.status===filter;
    const ms = !search||j.company.toLowerCase().includes(search.toLowerCase())||j.role.toLowerCase().includes(search.toLowerCase());
    return mf&&ms;
  });

  async function handleAdd(data) { setSaving(true); try { await addJob(data); setShowModal(false); toast.success("Application added!"); } catch { toast.error("Failed to add."); } finally { setSaving(false); } }
  async function handleEdit(data) { setSaving(true); try { await updateJob(editJob.id,data); setEditJob(null); toast.success("Updated!"); } catch { toast.error("Failed to update."); } finally { setSaving(false); } }
  async function handleDelete() { try { await deleteJob(deleteTarget); setDeleteTarget(null); toast.success("Deleted."); } catch { toast.error("Failed to delete."); } }
  async function handleResume(jobId,file) {
    if (file.size>5*1024*1024) { toast.error("Max 5MB!"); return; }
    try { await uploadResume(jobId,file); toast.success("Resume uploaded!"); } catch { toast.error("Upload failed."); }
  }

  const ov = {position:"fixed",inset:0,background:"rgba(10,9,8,0.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"};
  const md = {background:"#fff",borderRadius:"14px",border:"0.5px solid #E2DDD4",padding:"28px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto"};
  const mh = {fontFamily:"'DM Serif Display',serif",fontSize:"20px",fontWeight:"400",marginBottom:"20px"};

  return (
    <div style={{minHeight:"100vh",background:"#F5F3EE"}}>
      <Navbar />
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"28px 20px"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"28px",fontWeight:"400",color:"#1A1814"}}>Dashboard</h1>
            <p style={{fontSize:"13px",color:"#7A7568",marginTop:"3px"}}>{jobs.length} applications in pipeline</p>
          </div>
          <button onClick={()=>setShowModal(true)} style={{background:"#1A1814",color:"#fff",border:"none",borderRadius:"8px",padding:"9px 18px",fontSize:"13px",fontWeight:"500",cursor:"pointer"}}>+ Add Application</button>
        </div>

        <div style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
          {STATUSES.map(s=><StatsCard key={s} label={s} count={jobs.filter(j=>j.status===s).length} color={STATUS_COLORS[s].text} bg={STATUS_COLORS[s].bg} />)}
        </div>

        <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company or role…"
            style={{flex:1,minWidth:"200px",padding:"9px 12px",border:"0.5px solid #E2DDD4",borderRadius:"8px",background:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",outline:"none",boxSizing:"border-box"}} />
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {["All",...STATUSES].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 13px",borderRadius:"99px",border:"0.5px solid #E2DDD4",background:filter===f?"#1A1814":"#fff",color:filter===f?"#fff":"#7A7568",fontSize:"12px",fontWeight:"500",cursor:"pointer"}}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{background:"#fff",border:"0.5px solid #E2DDD4",borderRadius:"14px",overflow:"hidden"}}>
          {loading ? <div style={{padding:"48px",textAlign:"center",color:"#7A7568"}}>Loading…</div>
          : filtered.length===0 ? <div style={{padding:"52px",textAlign:"center",color:"#7A7568"}}><div style={{fontSize:"36px",marginBottom:"12px"}}>📋</div><p>No applications found.</p></div>
          : <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#F0EDE7",borderBottom:"0.5px solid #E2DDD4"}}>
                  {["Company / Role","Status","Date Applied","Resume","Actions"].map(h=>(
                    <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:"11px",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.5px",color:"#7A7568"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((job,i)=>(
                  <tr key={job.id} style={{borderBottom:i<filtered.length-1?"0.5px solid #E2DDD4":"none"}}>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{fontWeight:"600",fontSize:"13.5px"}}>{job.company}</div>
                      <div style={{fontSize:"12.5px",color:"#7A7568",marginTop:"2px"}}>{job.role}</div>
                      {job.notes&&<div style={{fontSize:"11px",color:"#AAA",marginTop:"2px"}}>{job.notes.slice(0,60)}{job.notes.length>60?"…":""}</div>}
                    </td>
                    <td style={{padding:"13px 16px"}}><StatusBadge status={job.status} /></td>
                    <td style={{padding:"13px 16px",fontSize:"12px",color:"#7A7568"}}>{job.dateApplied}</td>
                    <td style={{padding:"13px 16px"}}>
                      {job.resumeUrl
                        ? <a href={job.resumeUrl} target="_blank" rel="noreferrer" style={{fontSize:"12px",color:"#2D5BE3"}}>View PDF</a>
                        : <label style={{fontSize:"12px",color:"#7A7568",cursor:"pointer",textDecoration:"underline"}}>Upload<input type="file" accept=".pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleResume(job.id,e.target.files[0])} /></label>}
                    </td>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",gap:"6px"}}>
                        <button onClick={()=>setEditJob(job)} style={{background:"none",border:"0.5px solid #E2DDD4",borderRadius:"6px",padding:"5px 10px",fontSize:"12px",cursor:"pointer",color:"#7A7568"}}>Edit</button>
                        <button onClick={()=>setDeleteTarget(job.id)} style={{background:"none",border:"0.5px solid #F5AAAA",borderRadius:"6px",padding:"5px 10px",fontSize:"12px",cursor:"pointer",color:"#8B1A1A"}}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>

      {showModal&&<div style={ov} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}><div style={md}><h2 style={mh}>Add Application</h2><JobForm onSubmit={handleAdd} onCancel={()=>setShowModal(false)} loading={saving} /></div></div>}
      {editJob&&<div style={ov} onClick={e=>e.target===e.currentTarget&&setEditJob(null)}><div style={md}><h2 style={mh}>Edit Application</h2><JobForm initial={editJob} onSubmit={handleEdit} onCancel={()=>setEditJob(null)} loading={saving} /></div></div>}
      {deleteTarget&&<div style={ov} onClick={e=>e.target===e.currentTarget&&setDeleteTarget(null)}><div style={{...md,maxWidth:"360px"}}><h2 style={{...mh,color:"#8B1A1A"}}>Delete application?</h2><p style={{fontSize:"13px",color:"#7A7568",marginBottom:"20px"}}>This cannot be undone.</p><div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}><button onClick={()=>setDeleteTarget(null)} style={{background:"none",border:"0.5px solid #E2DDD4",borderRadius:"8px",padding:"8px 16px",fontSize:"13px",cursor:"pointer"}}>Cancel</button><button onClick={handleDelete} style={{background:"#c44",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 18px",fontSize:"13px",cursor:"pointer"}}>Delete</button></div></div></div>}
    </div>
  );
}`,

  'src/App.jsx': `import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'DM Sans', sans-serif", fontSize: "13px" } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}`,
};

// Create all files
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('✅ Created:', filePath);
}

console.log('\n🎉 All files created! Now run: npm run dev');