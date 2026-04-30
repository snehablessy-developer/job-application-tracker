import { useState, useEffect } from "react";
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
    const r = ref(storage, `resumes/${currentUser.uid}/${jobId}/${file.name}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await updateJob(jobId, { resumeUrl: url });
    return url;
  }

  return { jobs, loading, addJob, updateJob, deleteJob, uploadResume };
}