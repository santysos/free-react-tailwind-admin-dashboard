// src/services/therapists.ts
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

// ---------------- Types ----------------
export type TherapistPayloadCreate = {
  name: string;
  email: string;
  password: string;
  telefono?: string;          // ✅ opcional
  activo?: boolean;           // ✅ opcional (frontend)
};

export type TherapistPayloadUpdate = {
  name: string;
  email: string;
  password?: string | null;
  telefono?: string | null;
  activo?: boolean;
};

// Si su backend espera 1/0 en vez de boolean:
function normalizeActivo(activo?: boolean) {
  if (activo === undefined) return undefined;
  return activo ? 1 : 0;
}

// ---------------- API ----------------
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

export async function createTherapist(payload: TherapistPayloadCreate) {
  // normaliza payload (sin enviar basura)
  const cleanPayload: any = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
  };

  if (payload.telefono !== undefined) {
    const tel = (payload.telefono ?? "").trim();
    if (tel) cleanPayload.telefono = tel;
  }

  if (payload.activo !== undefined) {
    // 🔁 si su backend usa boolean, cambie esta línea a: cleanPayload.activo = payload.activo;
    cleanPayload.activo = normalizeActivo(payload.activo);
  }

  const res = await axios.post(`${API_BASE}/api/therapists`, cleanPayload, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });

  return res.data;
}

export async function updateTherapist(id: number, payload: TherapistPayloadUpdate) {
  const cleanPayload: any = {
    name: payload.name,
    email: payload.email,
  };

  if (payload.password !== undefined) {
    const p = (payload.password ?? "").trim();
    cleanPayload.password = p ? p : null;
  }

  if (payload.telefono !== undefined) {
    const tel = (payload.telefono ?? "").trim();
    cleanPayload.telefono = tel ? tel : null;
  }

  if (payload.activo !== undefined) {
    // 🔁 si su backend usa boolean, cambie esta línea a: cleanPayload.activo = payload.activo;
    cleanPayload.activo = normalizeActivo(payload.activo);
  }

  const res = await axios.put(`${API_BASE}/api/therapists/${id}`, cleanPayload, {
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
