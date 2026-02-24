import { useEffect, useMemo, useState } from "react";
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

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Title>Filter Global Dashboard</Title>
            <Subtitle>Rentang tanggal untuk seluruh metrik dan chart</Subtitle>
          </div>
          <DateRangePicker value={dateRange} onValueChange={setDateRange} className="max-w-md" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
          <Subtitle>Total Berita</Subtitle>
          <Metric>{loading ? "..." : data.totalNews}</Metric>
        </Card>
        <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
          <Subtitle>Kategori Terbanyak</Subtitle>
          <Metric>{loading ? "..." : data.topCategory}</Metric>
        </Card>
        <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
          <Subtitle>Waktu Sync Terakhir</Subtitle>
          <Metric className="text-base">{loading ? "..." : formatDate(data.lastSync?.synced_at)}</Metric>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
          <Title>Distribusi Kategori</Title>
          <Subtitle>Persentase berita per kategori</Subtitle>
          <div className="mt-4 h-72">
            <DonutChart data={donutData} category="value" index="name" colors={["blue", "cyan", "indigo", "sky"]} />
          </div>
        </Card>

        <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
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

      <Card className="rounded-2xl bg-white/90 shadow-panel backdrop-blur">
        <Title>Trending Topics</Title>
        <Subtitle>Kata kunci dari hasil analitik backend</Subtitle>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.trendingTopics.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data trending topics.</p>
          ) : (
            data.trendingTopics.map((item) => (
              <article
                key={`${item.keyword}-${item.category}`}
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
              >
                <p className="font-semibold text-slate-800">{item.keyword}</p>
                <p className="text-xs text-slate-500">Kategori: {item.category}</p>
                <p className="text-xs text-slate-500">Frekuensi: {item.frequency}</p>
              </article>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
