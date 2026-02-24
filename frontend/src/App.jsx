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
      <header className="mb-6 rounded-2xl bg-white/85 p-5 shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">News Ops Console</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Aplikasi Pengelolaan Berita & Analitik
        </h1>
        <p className="mt-2 text-sm text-slate-600">
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
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
