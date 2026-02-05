import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { getDashboardCharts } from "../../services/dashboard";

// Tipos esperados desde el backend
type DashboardChartsResponse = {
  labels: string[];
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

export default function DashboardCharts() {
  const [data, setData] = useState<DashboardChartsResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardCharts();
        setData(res);
      } catch {
        // si falla conexión, no rompe el dashboard
      }
    })();
  }, []);

  const labels = data?.labels ?? [];
  const income = data?.series.income_monthly ?? [];
  const sessions = data?.series.sessions_monthly ?? [];
  const eva = data?.series.eva_avg_monthly ?? [];

  // ---------------- Ingresos ----------------
  const incomeOptions = useMemo<ApexOptions>(() => ({
    chart: { type: "area", toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: labels },
    yaxis: {
      labels: { formatter: (v: number) => `$${Math.round(v)}` },
    },
    tooltip: {
      y: { formatter: (v: number) => `$${v.toFixed(2)}` },
    },
    grid: { strokeDashArray: 4 },
  }), [labels]);

  // ---------------- EVA ----------------
  const evaOptions = useMemo<ApexOptions>(() => ({
    chart: { type: "line", toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: labels },
    yaxis: { min: 0, max: 10, tickAmount: 5 },
    tooltip: {
      y: { formatter: (v: number) => v.toFixed(2) },
    },
    grid: { strokeDashArray: 4 },
  }), [labels]);

  // ---------------- Sesiones ----------------
  const sessionsOptions = useMemo<ApexOptions>(() => ({
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 8, columnWidth: "45%" },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: labels },
    grid: { strokeDashArray: 4 },
  }), [labels]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Ingresos */}
      <div className="col-span-12 xl:col-span-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Ingresos por mes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Suma de abonos registrados en sesiones
          </p>
        </div>

        <ReactApexChart
          type="area"
          height={320}
          options={incomeOptions}
          series={[{ name: "Ingresos", data: income }]}
        />
      </div>

      {/* Métodos de pago */}
      <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <PaymentMethodsDonut raw={data?.payment_methods_month ?? []} />
      </div>

      {/* EVA */}
      <div className="col-span-12 xl:col-span-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            EVA promedio por mes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tendencia del dolor (0–10)
          </p>
        </div>

        <ReactApexChart
          type="line"
          height={280}
          options={evaOptions}
          series={[{ name: "EVA", data: eva }]}
        />
      </div>

      {/* Sesiones */}
      <div className="col-span-12 xl:col-span-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sesiones por mes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Volumen de atención mensual
          </p>
        </div>

        <ReactApexChart
          type="bar"
          height={280}
          options={sessionsOptions}
          series={[{ name: "Sesiones", data: sessions }]}
        />
      </div>
    </div>
  );
}

// ---------------- Donut métodos de pago ----------------
function PaymentMethodsDonut({
  raw,
}: {
  raw: Array<{ metodo: string; total: number }>;
}) {
  const labels = raw.map((x) => x.metodo);
  const series = raw.map((x) => x.total);

  const options: ApexOptions = {
    labels,
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Métodos de pago (mes)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Distribución de cobros
        </p>
      </div>

      {series.length ? (
        <ReactApexChart
          type="donut"
          height={320}
          options={options}
          series={series}
        />
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Sin datos todavía.
        </div>
      )}
    </div>
  );
}
