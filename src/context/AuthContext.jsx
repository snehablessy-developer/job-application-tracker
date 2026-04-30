import { createContext, useContext, useEffect, useState } from "react";
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
}