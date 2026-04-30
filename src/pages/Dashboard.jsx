import { useState } from "react";
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
}