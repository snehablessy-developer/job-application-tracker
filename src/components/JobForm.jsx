import { useState } from "react";
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
}