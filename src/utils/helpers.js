export function formatDate(dateStr) {
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
}