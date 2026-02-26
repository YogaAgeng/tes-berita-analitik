import { useState } from "react";
import { RiArticleLine, RiBarChartBoxLine } from "@remixicon/react";
import NewsManagementPage from "./pages/NewsManagementPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

const tabs = [
  { id: "news", label: "Manajemen Berita", icon: RiArticleLine },
  { id: "dashboard", label: "Dashboard Analitik", icon: RiBarChartBoxLine },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("news");

  return (
    <div className="min-h-screen w-full bg-[#F4F7FE] p-4 font-sans md:p-8 fade-in">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="mb-1 text-sm font-bold uppercase tracking-wider text-[#707EAE]">
              Main Console
            </h4>
            <h1 className="text-3xl font-bold text-[#2B3674]">News Operations</h1>
          </div>

          <nav className="flex rounded-xl bg-white/40 p-1 backdrop-blur-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${active
                    ? "bg-white font-bold text-[#4318FF] shadow-sm"
                    : "font-medium text-[#8393BC] hover:text-[#2B3674]"
                    }`}
                >
                  <Icon size={16} />
                  {tab.id === "news" ? "Manajemen" : "Analitik"}
                </button>
              );
            })}
          </nav>
        </header>

        <main className="flex flex-col gap-6">
          {activeTab === "news" ? (
            <NewsManagementPage
              renderSections={({ filterSection, tableSection }) => (
                <>
                  <div className="w-full rounded-[20px] bg-white p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                    <h2 className="mb-4 text-xl font-bold text-[#2B3674]">
                      Sinkronisasi &amp; Filter Data
                    </h2>
                    {filterSection}
                  </div>

                  <div className="w-full overflow-hidden rounded-[20px] bg-white p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-[#2B3674]">Data Berita Terbaru</h2>
                    </div>
                    {tableSection}
                  </div>
                </>
              )}
            />
          ) : (
            <DashboardPage />
          )}
        </main>
      </div>
    </div>
  );
}
