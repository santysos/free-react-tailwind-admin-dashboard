import { api } from "../lib/api";

export type DashboardSummary = {
  ok: boolean;
  cards: {
    patients_total: number;
    sessions_today: number;
    consultations_month: number;
    income_month: string;
  };
  latest_sessions: Array<{
    id: number;
    fecha: string | null;
    eva: number | null;
    abono: string | number | null;
    metodo_pago: string | null;
    patient_id: number | null;
    patient_name: string;
    consultation_id: number | null;
  }>;
};

export type DashboardCharts = {
  ok: boolean;
  labels: string[]; // ["Jan","Feb",...]
  series: {
    income_monthly: number[];
    sessions_monthly: number[];
    eva_avg_monthly: number[];
  };
  payment_methods_month: Array<{
    metodo: string;
    total: number;
  }>;
};

export async function getDashboardSummary() {
  const res = await api.get<DashboardSummary>("/dashboard/summary");
  return res.data;
}

export async function getDashboardCharts(year?: number) {
  const res = await api.get<DashboardCharts>("/dashboard/charts", {
    params: year ? { year } : undefined,
  });
  return res.data;
}
