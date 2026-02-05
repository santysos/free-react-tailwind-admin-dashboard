// src/services/auth.ts
import api from "./api";

export async function authMe() {
  const { data } = await api.get("/auth/me");
  return data; // { user: {...} }
}
