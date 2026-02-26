import { useEffect, useMemo, useState } from "react";
import {
  RiBarChartBoxLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiFileTextLine,
  RiFireLine,
  RiPieChartLine,
  RiRefreshLine,
} from "@remixicon/react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { api } from "../api.js";

/* ── Date helpers for native inputs ──────────────────── */
const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fromInputDate = (s) => {
  if (!s) return undefined;
  return new Date(s);
};

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

const normalizeRangeOrder = (range) => {
  const { from, to } = range;
  if (!from || !to) {
    return range;
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return range;
  }

  if (fromDate > toDate) {
    return { from: toDate, to: fromDate, swapped: true };
  }

  return range;
};

const formatNumber = (value) => Number(value || 0).toLocaleString("id-ID");

/* ── Empty State Component ───────────────────────────── */
function EmptyChart({ message = "Belum ada data untuk ditampilkan" }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-[#A3AED0]">
      <RiBarChartBoxLine size={40} className="text-[#D9E0F2]" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

/* ── Skeleton Components ─────────────────────────────── */
function SkeletonMetricCard() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-8 w-16" />
        </div>
        <div className="skeleton h-11 w-11 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="skeleton h-40 w-40 rounded-full" />
      <div className="flex gap-3">
        <div className="skeleton h-3 w-12" />
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-10" />
      </div>
    </div>
  );
}

function SkeletonAreaChart() {
  return (
    <div className="flex h-full flex-col justify-end gap-2 px-4 pb-4">
      <div className="flex items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85, 45, 70].map((h, i) => (
          <div
            key={i}
            className="skeleton flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="skeleton mt-2 h-3 w-full" />
    </div>
  );
}

const DONUT_COLORS = ["#4318FF", "#6B5BFF", "#A3AED0", "#39B8FF", "#05CD99", "#FFB547"];

function CategoryDonutChart({ data }) {
  const total = data.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedTotal(Math.round(total * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [total]);

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload;
    return (
      <div className="bg-white px-4 py-2 rounded-xl shadow-[0px_18px_40px_rgba(112,144,176,0.12)] border-none text-[#2B3674] font-bold text-sm pointer-events-none z-50">
        <p>
          <span className="font-semibold capitalize">{point.name}:</span>{" "}
          <span className="font-bold">{formatNumber(point.value)}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 18 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={78}
            outerRadius={122}
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={customTooltip}
            offset={14}
            cursor={{ fill: "rgba(67, 24, 255, 0.06)" }}
            wrapperStyle={{ pointerEvents: "none", zIndex: 50 }}
          />
          <Legend verticalAlign="bottom" height={30} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-extrabold text-[#2B3674] sm:text-5xl">{formatNumber(animatedTotal)}</p>
        <p className="mt-1 text-sm font-medium uppercase tracking-wider text-[#A3AED0]">Total Berita</p>
      </div>
    </div>
  );
}

function DailyTrendBars({ data }) {
  const formatTick = (value) => {
    const parts = String(value || "").split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return value;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 10, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E8F0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            tick={{ fontSize: 11, fill: "#A3AED0" }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#A3AED0" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            cursor={{ fill: "rgba(67, 24, 255, 0.06)" }}
            formatter={(value) => [formatNumber(value), "Jumlah"]}
            labelFormatter={(label) => `Tanggal: ${label}`}
          />
          <Bar
            dataKey="total"
            fill="#4318FF"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SkeletonTopicCard() {
  return (
    <div className="rounded-xl border border-[#E6E8F0] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-7 w-7 rounded-lg" />
      </div>
      <div className="skeleton mt-2 h-3 w-20" />
      <div className="mt-3 space-y-2">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3 w-8" />
        </div>
        <div className="skeleton h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
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
    () =>
      data.byCategory.map((item) => ({
        name: item.category,
        value: Number(item.total),
      })),
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
    () =>
      Math.max(
        ...data.trendingTopics.map((item) => Number(item.frequency || 0)),
        1,
      ),
    [data.trendingTopics],
  );

  const applyPresetRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setDateRange({ from: start, to: end });
  };

  const updateDateRange = (nextRange, { notifySwap = false } = {}) => {
    const normalized = normalizeRangeOrder(nextRange);
    const swapped = normalized.swapped === true;
    const { from, to } = normalized;

    if (swapped && notifySwap) {
      toast("Rentang tanggal dibalik otomatis agar valid (dari <= sampai)");
    }

    setDateRange({ from, to });
  };

  /* ── Metric card data ──────────────────────────────── */
  const metrics = [
    {
      label: "Total Berita",
      value: formatNumber(data.totalNews),
      icon: RiFileTextLine,
      iconBg: "bg-[#F4F7FE]",
      iconColor: "text-[#4318FF]",
    },
    {
      label: "Kategori Terbanyak",
      value: data.topCategory,
      icon: RiPieChartLine,
      iconBg: "bg-[#E8FFF9]",
      iconColor: "text-[#05CD99]",
    },
    {
      label: "Data Harian",
      value: formatNumber(data.byDay.length),
      icon: RiCalendarEventLine,
      iconBg: "bg-[#FFF4DE]",
      iconColor: "text-[#FFB547]",
    },
  ];

  return (
    <section className="space-y-6">
      {/* ── Header Card ──────────────────────────────────── */}
      <div className="card overflow-hidden p-6">

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A3AED0]">
                Analitik Real-Time
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#2B3674]">
                Dashboard Tren Berita
              </h2>
              <p className="mt-1 text-sm font-medium text-[#A3AED0]">
                Filter rentang tanggal untuk metrik, kategori, dan tren harian
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F7FE] px-4 py-2 text-xs font-medium text-[#A3AED0]">
              <RiRefreshLine size={14} className="text-[#A3AED0]" />
              Last Sync:{" "}
              {loading ? (
                <span className="skeleton inline-block h-3 w-24" />
              ) : (
                <span className="font-medium text-[#2B3674]">{formatDate(data.lastSync?.synced_at)}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Native Date Range Inputs */}
            <div className="flex items-center gap-2">
              <RiCalendarLine size={18} className="flex-shrink-0 text-[#A3AED0]" />
              <input
                type="date"
                value={toInputDate(dateRange.from)}
                onChange={(e) =>
                  updateDateRange(
                    {
                      ...dateRange,
                      from: fromInputDate(e.target.value),
                    },
                    { notifySwap: true },
                  )
                }
                className="input-field w-auto"
              />
              <span className="text-xs text-[#A3AED0]">—</span>
              <input
                type="date"
                value={toInputDate(dateRange.to)}
                onChange={(e) =>
                  updateDateRange(
                    {
                      ...dateRange,
                      to: fromInputDate(e.target.value),
                    },
                    { notifySwap: true },
                  )
                }
                className="input-field w-auto"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "7 Hari", days: 7 },
                { label: "30 Hari", days: 30 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => applyPresetRange(preset.days)}
                  className="btn-press rounded-full border border-[#E6E8F0] bg-white px-4 py-2 text-xs font-medium text-[#A3AED0] transition-all duration-150 hover:bg-[#F4F7FE]"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setDateRange({ from: undefined, to: undefined })
                }
                className="btn-press rounded-full bg-[#4318FF] hover:bg-[#3311DB] text-white px-4 py-2 text-xs font-medium transition-all active:scale-95"
              >
                Semua Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
            <SkeletonMetricCard key={`skel-m-${i}`} />
          ))
          : metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card lift p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#A3AED0]">
                      {m.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-[#2B3674]">
                      {m.value}
                    </p>
                  </div>
                  <span
                    className={`rounded-xl ${m.iconBg} p-3 ${m.iconColor}`}
                  >
                    <Icon size={20} />
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-base font-bold text-[#2B3674]">
            Distribusi Kategori
          </h3>
          <p className="mt-0.5 text-xs font-medium text-[#A3AED0]">
            Persentase berita per kategori
          </p>
          <div className="mt-5 h-80">
            {loading ? (
              <SkeletonChart />
            ) : donutData.length === 0 ? (
              <EmptyChart message="Pilih rentang tanggal untuk melihat distribusi kategori" />
            ) : (
              <CategoryDonutChart data={donutData} />
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-bold text-[#2B3674]">
            Tren Berita Harian
          </h3>
          <p className="mt-0.5 text-xs font-medium text-[#A3AED0]">
            Jumlah berita per hari
          </p>
          <div className="mt-5 h-80">
            {loading ? (
              <SkeletonAreaChart />
            ) : areaData.length === 0 ? (
              <EmptyChart message="Pilih rentang tanggal untuk melihat tren harian" />
            ) : (
              <DailyTrendBars data={areaData} />
            )}
          </div>
        </div>
      </div>

      {/* ── Trending Topics ──────────────────────────────── */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-[#2B3674]">Trending Topics</h3>
        <p className="mt-0.5 text-xs font-medium text-[#A3AED0]">
          Kata kunci dari hasil analitik backend
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTopicCard key={`skel-t-${i}`} />
            ))
          ) : data.trendingTopics.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-2 py-8 text-[#A3AED0]">
              <RiFireLine size={32} className="text-[#D9E0F2]" />
              <p className="text-sm font-medium">Belum ada data trending topics.</p>
            </div>
          ) : (
            data.trendingTopics.map((item) => (
              <article
                key={`${item.keyword}-${item.category}`}
                className="lift rounded-xl border border-[#E6E8F0] bg-[#FDFEFF] p-4 transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#2B3674]">{item.keyword}</p>
                  <span className="flex-shrink-0 rounded-lg bg-[#EBE5FF] p-1.5 text-[#4318FF]">
                    <RiFireLine size={14} />
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-[#A3AED0]">
                  Kategori: {item.category}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                    <span>Frekuensi</span>
                    <span className="font-semibold text-[#2B3674]">
                      {formatNumber(item.frequency)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F7]">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#6B5BFF] to-[#4318FF] transition-all duration-500"
                      style={{
                        width: `${Math.max((Number(item.frequency || 0) / topFrequency) * 100, 6)}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
