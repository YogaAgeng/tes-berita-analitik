import { useEffect, useMemo, useState } from "react";
import {
  RiCalendarEventLine,
  RiFireLine,
  RiLineChartLine,
  RiPieChartLine,
  RiRefreshLine,
} from "@remixicon/react";
import {
  AreaChart,
  Card,
  DateRangePicker,
  DonutChart,
  Metric,
  Subtitle,
  Title,
} from "@tremor/react";
import toast from "react-hot-toast";
import { api } from "../api.js";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID");
};

const toDateRangeQuery = (range) => {
  if (!range?.from && !range?.to) {
    return {};
  }
  return {
    from: range.from ? new Date(range.from).toISOString() : undefined,
    to: range.to ? new Date(range.to).toISOString() : undefined,
  };
};

const formatNumber = (value) => Number(value || 0).toLocaleString("id-ID");

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalNews: 0,
    topCategory: "-",
    lastSync: null,
    byCategory: [],
    byDay: [],
    trendingTopics: [],
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data: result } = await api.get("/news/dashboard", {
        params: toDateRangeQuery(dateRange),
      });
      setData(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [dateRange.from, dateRange.to]);

  const donutData = useMemo(
    () => data.byCategory.map((item) => ({ name: item.category, value: Number(item.total) })),
    [data.byCategory],
  );

  const areaData = useMemo(
    () =>
      data.byDay.map((item) => ({
        date: new Date(item.date).toLocaleDateString("id-ID"),
        total: Number(item.total),
      })),
    [data.byDay],
  );

  const topFrequency = useMemo(
    () => Math.max(...data.trendingTopics.map((item) => Number(item.frequency || 0)), 1),
    [data.trendingTopics],
  );

  const applyPresetRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setDateRange({ from: start, to: end });
  };

  return (
    <section className="space-y-5">
      <Card className="glass-panel mesh-strip rounded-3xl p-0">
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Analitik Real-Time</p>
              <Title>Dashboard Tren Berita</Title>
              <Subtitle>Filter rentang tanggal untuk metrik, kategori, dan tren harian</Subtitle>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700">
              <RiRefreshLine size={14} />
              Last Sync: {loading ? "..." : formatDate(data.lastSync?.synced_at)}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <DateRangePicker value={dateRange} onValueChange={setDateRange} className="max-w-md" />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPresetRange(7)}
                className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => applyPresetRange(30)}
                className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
              >
                30 Hari
              </button>
              <button
                type="button"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Semua Data
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="glass-panel lift rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <Subtitle>Total Berita</Subtitle>
              <Metric>{loading ? "..." : formatNumber(data.totalNews)}</Metric>
            </div>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600">
              <RiLineChartLine size={16} />
            </span>
          </div>
        </Card>
        <Card className="glass-panel lift rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <Subtitle>Kategori Terbanyak</Subtitle>
              <Metric>{loading ? "..." : data.topCategory}</Metric>
            </div>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <RiPieChartLine size={16} />
            </span>
          </div>
        </Card>
        <Card className="glass-panel lift rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <Subtitle>Data Harian</Subtitle>
              <Metric>{loading ? "..." : formatNumber(data.byDay.length)}</Metric>
            </div>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600">
              <RiCalendarEventLine size={16} />
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="glass-panel rounded-3xl">
          <Title>Distribusi Kategori</Title>
          <Subtitle>Persentase berita per kategori</Subtitle>
          <div className="mt-4 h-72">
            <DonutChart
              data={donutData}
              category="value"
              index="name"
              colors={["blue", "cyan", "emerald", "sky", "teal"]}
            />
          </div>
        </Card>

        <Card className="glass-panel rounded-3xl">
          <Title>Tren Berita Harian</Title>
          <Subtitle>Jumlah berita per hari</Subtitle>
          <div className="mt-4 h-72">
            <AreaChart
              data={areaData}
              index="date"
              categories={["total"]}
              colors={["blue"]}
              yAxisWidth={42}
            />
          </div>
        </Card>
      </div>

      <Card className="glass-panel rounded-3xl">
        <Title>Trending Topics</Title>
        <Subtitle>Kata kunci dari hasil analitik backend</Subtitle>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.trendingTopics.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data trending topics.</p>
          ) : (
            data.trendingTopics.map((item) => (
              <article
                key={`${item.keyword}-${item.category}`}
                className="lift rounded-xl border border-slate-200 bg-white/80 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800">{item.keyword}</p>
                  <span className="rounded-full bg-rose-50 p-1 text-rose-600">
                    <RiFireLine size={12} />
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Kategori: {item.category}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Frekuensi</span>
                    <span>{formatNumber(item.frequency)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      style={{ width: `${Math.max((Number(item.frequency || 0) / topFrequency) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
