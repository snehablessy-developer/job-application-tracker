import { STATUS_COLORS } from "../utils/helpers";
export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Applied"];
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:"600", background:c.bg, color:c.text, border:`0.5px solid ${c.border}` }}>
      {status}
    </span>
  );
}