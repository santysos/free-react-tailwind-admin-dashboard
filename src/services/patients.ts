import { api } from "../lib/api";

/* =====================================================
 * Types
 * ===================================================== */

export type Patient = {
  id: number;
  identificacion?: string | null;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: string | null;

  celular?: string | null;
  sector?: string | null;

  antecedentes?: string | null;
  alergias?: string | null;
  actividad?: string | null;
  canal?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type PatientPayload = {
  identificacion?: string | null;
  nombres: string;
  apellidos: string;

  fecha_nacimiento?: string | null; // YYYY-MM-DD
  celular?: string | null;
  sector?: string | null;

  antecedentes?: string | null;
  alergias?: string | null;
  actividad?: string | null;
  canal?: string | null;
};

export type ListPatientsParams = {
  q?: string;
  page?: number;
};

/* =====================================================
 * Services
 * ===================================================== */

/**
 * GET /api/patients
 * Laravel pagination:
 * { data: Patient[], links, meta, ... }
 */
export async function listPatients(params?: ListPatientsParams) {
  const res = await api.get("/patients", { params });
  return res.data;
}

/**
 * POST /api/patients
 * Response: { ok: true, patient }
 */
export async function createPatient(payload: PatientPayload) {
  const res = await api.post("/patients", payload);
  return res.data; // { ok, patient }
}

/**
 * GET /api/patients/{id}
 * Response: { ok: true, patient }
 */
export async function getPatient(id: number) {
  const res = await api.get(`/patients/${id}`);
  return res.data; // { ok, patient }
}

/**
 * PUT /api/patients/{id}
 * Response: { ok: true, patient }
 */
export async function updatePatient(id: number, payload: PatientPayload) {
  const res = await api.put(`/patients/${id}`, payload);
  return res.data; // { ok, patient }
}

/**
 * DELETE /api/patients/{id}
 * Response: { ok: true }
 */
export async function deletePatient(id: number) {
  const res = await api.delete(`/patients/${id}`);
  return res.data;
}

/**
 * GET /api/patients/{id}/history
 * Response: { ok, patient, consultations }
 */
export async function patientHistory(id: number) {
  const res = await api.get(`/patients/${id}/history`);
  return res.data;
}
