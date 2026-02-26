import { memo } from "react";

function NewsFilterSyncSection({
  search,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  onCreateClick,
  syncTopic,
  onSyncTopicChange,
  quickTopics,
  onQuickTopicClick,
  lastSyncText,
  syncing,
  onSync,
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:w-1/2 lg:flex-1">
          <label htmlFor="news-search" className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
            Pencarian Berita
          </label>
          <input
            id="news-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul atau deskripsi..."
            className="input-field"
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <select
            id="news-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input-field w-full sm:w-52"
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onCreateClick}
            className="btn-press rounded-xl border border-[#E6E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#2B3674] transition hover:bg-[#F4F7FE]"
          >
            Tambah Berita
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-[#F4F7FE] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="sync-topic" className="text-sm font-medium text-[#A3AED0]">
              Topik:
            </label>
            <input
              type="text"
              id="sync-topic"
              value={syncTopic}
              onChange={(e) => onSyncTopicChange(e.target.value)}
              placeholder="Ketik topik atau klik saran di bawah..."
              className="w-full rounded-xl border border-[#E6E8F0] bg-white px-3 py-2.5 text-sm text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onQuickTopicClick(topic)}
                className={`btn-press rounded-full border px-3 py-1 text-xs font-medium transition ${syncTopic.trim().toLowerCase() === topic.toLowerCase()
                  ? "border-[#4318FF] bg-[#EBE5FF] text-[#4318FF]"
                  : "cursor-pointer border-[#E6E8F0] bg-white text-[#A3AED0] transition-colors hover:bg-[#F4F7FE]"
                  }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end">
          <p className="text-xs font-medium text-[#A3AED0]">
            Last Sync: <span className="font-medium text-[#2B3674]">{lastSyncText}</span>
          </p>
          <button
            type="button"
            onClick={onSync}
            disabled={syncing}
            className="btn-press inline-flex items-center justify-center gap-2 bg-[#4318FF] hover:bg-[#3311DB] text-white rounded-xl px-5 py-3 font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {syncing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {syncing ? "Syncing..." : "Sync Berita"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(NewsFilterSyncSection);
