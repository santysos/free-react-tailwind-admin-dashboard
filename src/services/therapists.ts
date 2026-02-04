import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token") || "";
}

function authHeaders() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function listTherapists(params?: { q?: string; page?: number }) {
  const q = params?.q ?? "";
  const page = params?.page ?? 1;

  const res = await axios.get(`${API_BASE}/api/therapists`, {
    params: { q, page },
    headers: authHeaders(),
  });

  return res.data; // paginate
}

export async function getTherapist(id: number) {
  const res = await axios.get(`${API_BASE}/api/therapists/${id}`, {
    headers: authHeaders(),
  });
  return res.data; // { ok, therapist }
}

export async function createTherapist(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await axios.post(`${API_BASE}/api/therapists`, payload, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
}

export async function updateTherapist(
  id: number,
  payload: { name: string; email: string; password?: string | null }
) {
  const res = await axios.put(`${API_BASE}/api/therapists/${id}`, payload, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
}

export async function deleteTherapist(id: number) {
  const res = await axios.delete(`${API_BASE}/api/therapists/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
}
