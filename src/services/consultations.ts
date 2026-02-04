import { api } from "../lib/api";

export async function createConsultation(payload: any) {
  const res = await api.post("/consultations", payload);
  return res.data;
}
