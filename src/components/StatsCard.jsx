export default function StatsCard({ label, count, color, bg }) {
  return (
    <div style={{ background:bg, border:"0.5px solid #E2DDD4", borderRadius:"14px", padding:"16px 20px", flex:1, minWidth:"120px" }}>
      <div style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px", color:"#7A7568", marginBottom:"8px" }}>{label}</div>
      <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:"28px", color }}>{count}</div>
    </div>
  );
}