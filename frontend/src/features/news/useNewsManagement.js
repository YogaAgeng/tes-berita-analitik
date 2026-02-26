import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api.js";

const DEFAULT_LIMIT = 20;

export function useNewsManagement() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncTopic, setSyncTopic] = useState("Teknologi");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const quickTopics = ["Teknologi", "Olahraga", "Pemilu", "Bisnis", "Startup"];

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: newsData }, { data: lastSyncData }] = await Promise.all([
        api.get("/news", {
          params: {
            search: search || undefined,
            category: category || undefined,
            sortBy: "published_at",
            order: "DESC",
            page,
            limit: DEFAULT_LIMIT,
          },
        }),
        api.get("/news/last-sync"),
      ]);

      setNews(newsData.data || []);
      setPagination(newsData.pagination || {
        page,
        limit: DEFAULT_LIMIT,
        total: (newsData.data || []).length,
        totalPages: 1,
      });
      setLastSync(lastSyncData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data berita");
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    const timeout = setTimeout(loadNews, 250);
    return () => clearTimeout(timeout);
  }, [loadNews]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const categories = useMemo(
    () => Array.from(new Set(news.map((item) => item.category).filter(Boolean))).sort(),
    [news],
  );

  const handleSync = useCallback(async () => {
    const topic = syncTopic.trim();
    if (!topic) {
      toast.error("Topik sync wajib diisi");
      return;
    }

    setSyncing(true);
    const syncToast = toast.loading("Sinkronisasi berita sedang berjalan...");
    try {
      const { data } = await api.post("/news/sync", null, { params: { q: topic } });
      toast.success(
        `Topik "${topic}" selesai. Fetched: ${data.fetched ?? 0}, Baru: ${data.inserted ?? 0}, Duplikat: ${data.duplicated ?? 0}`,
        { id: syncToast },
      );
      setLastSync(data.lastSync);
      await loadNews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sinkronisasi gagal", { id: syncToast });
    } finally {
      setSyncing(false);
    }
  }, [loadNews, syncTopic]);

  const handleCreate = useCallback(async (payload) => {
    try {
      await api.post("/news", payload);
      toast.success("Berita berhasil ditambahkan");
      await loadNews();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan berita");
      return false;
    }
  }, [loadNews]);

  const handleUpdate = useCallback(async (id, payload) => {
    try {
      await api.put(`/news/${id}`, payload);
      toast.success("Berita berhasil diperbarui");
      await loadNews();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan berita");
      return false;
    }
  }, [loadNews]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/news/${id}`);
      toast.success("Berita berhasil dihapus");
      await loadNews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus berita");
    }
  }, [loadNews]);

  return {
    state: {
      news,
      loading,
      syncing,
      syncTopic,
      search,
      category,
      lastSync,
      categories,
      page,
      pagination,
      quickTopics,
    },
    actions: {
      setSyncTopic,
      setSearch,
      setCategory,
      setPage,
      handleSync,
      handleCreate,
      handleUpdate,
      handleDelete,
    },
  };
}
