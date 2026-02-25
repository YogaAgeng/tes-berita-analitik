import { useMemo, useState } from "react";
import { RiArticleLine, RiBarChartBoxLine } from "@remixicon/react";
import NewsManagementPage from "./pages/NewsManagementPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

const tabs = [
  { id: "news", label: "Manajemen Berita", icon: RiArticleLine },
  { id: "dashboard", label: "Dashboard Analitik", icon: RiBarChartBoxLine },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("news");

  const CurrentPage = useMemo(
    () => (activeTab === "news" ? NewsManagementPage : DashboardPage),
    [activeTab],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 fade-in">
      <header className="mesh-strip glass-panel mb-6 rounded-3xl p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">News Ops Console</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Aplikasi Pengelolaan Berita & Analitik
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Kelola data berita, sinkronisasi API publik, dan pantau trending topics secara real-time.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-500 text-white shadow"
                    : "bg-white/80 text-slate-700 hover:bg-white"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main>
        <CurrentPage />
      </main>
    </div>
  );
}
