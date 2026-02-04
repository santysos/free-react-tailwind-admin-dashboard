import { api } from "../lib/api";

export async function createTreatmentSession(payload: any) {
  const res = await api.post("/treatment-sessions", payload);
  return res.data;
}

export async function listTreatmentSessions(consultation_id: number) {
  const res = await api.get("/treatment-sessions", { params: { consultation_id } });
  return res.data;
}
