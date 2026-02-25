import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api.js";
import NewsFormModal from "../components/NewsFormModal.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID");
};

export default function NewsManagementPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadNews = async () => {
    setLoading(true);
    try {
      const [{ data }, { data: lastSyncData }] = await Promise.all([
        api.get("/news", {
          params: {
            search: search || undefined,
            category: category || undefined,
            sortBy: "published_at",
            order: "DESC",
          },
        }),
        api.get("/news/last-sync"),
      ]);
      setNews(data);
      setLastSync(lastSyncData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data berita");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(loadNews, 250);
    return () => clearTimeout(timeout);
  }, [search, category]);

  const categories = useMemo(
    () => Array.from(new Set(news.map((item) => item.category).filter(Boolean))).sort(),
    [news],
  );

  const handleSync = async () => {
    setSyncing(true);
    const syncToast = toast.loading("Sinkronisasi berita sedang berjalan...");
    try {
      const { data } = await api.post("/news/sync");
      toast.success(
        `Sync selesai. Fetched: ${data.fetched ?? 0}, Baru: ${data.inserted ?? 0}, Duplikat: ${data.duplicated ?? 0}`,
        { id: syncToast },
      );
      setLastSync(data.lastSync);
      await loadNews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sinkronisasi gagal", { id: syncToast });
    } finally {
      setSyncing(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingItem) {
        await api.put(`/news/${editingItem.id}`, payload);
        toast.success("Berita berhasil diperbarui");
      } else {
        await api.post("/news", payload);
        toast.success("Berita berhasil ditambahkan");
      }
      closeModal();
      await loadNews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan berita");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/news/${id}`);
      toast.success("Berita berhasil dihapus");
      await loadNews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus berita");
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white/90 p-4 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau deskripsi..."
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-0 focus:border-brand-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="">Semua kategori</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <p className="text-xs font-medium text-slate-500">
              Last Sync: <span className="text-slate-700">{formatDateTime(lastSync?.synced_at)}</span>
            </p>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {syncing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {syncing ? "Syncing..." : "Sync Berita"}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/90 shadow-panel backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Sumber</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data berita
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="max-w-lg font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.source}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(item.published_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewsFormModal
        open={modalOpen}
        initialData={editingItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
