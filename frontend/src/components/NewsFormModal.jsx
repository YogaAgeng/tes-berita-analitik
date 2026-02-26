import { useEffect, useState } from "react";
import { RiCloseLine } from "@remixicon/react";

const initialForm = {
  title: "",
  description: "",
  source: "",
  published_at: "",
  category: "general",
  url: "",
};

export default function NewsFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        ...initialData,
        published_at: initialData.published_at
          ? new Date(initialData.published_at).toISOString().slice(0, 16)
          : "",
      });
      return;
    }
    setForm(initialForm);
  }, [initialData, open]);

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      published_at: new Date(form.published_at)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
    });
  };

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#2B3674]/35 p-4">
      <div className="modal-panel w-full max-w-2xl rounded-[20px] border-none bg-white shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#E6E8F0] px-6 py-4">
          <h2 className="text-lg font-bold text-[#2B3674]">
            {initialData ? "Edit Berita" : "Tambah Berita Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#A3AED0] transition-colors hover:bg-[#F4F7FE] hover:text-[#2B3674]"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* ── Form Body ────────────────────────────────────── */}
        <form onSubmit={submit} className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Judul (full width) */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
                Judul <span className="text-rose-400">*</span>
              </label>
              <input
                required
                value={form.title}
                onChange={update("title")}
                placeholder="Masukkan judul berita"
                className="input-field"
              />
            </div>

            {/* Sumber */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
                Sumber <span className="text-rose-400">*</span>
              </label>
              <input
                required
                value={form.source}
                onChange={update("source")}
                placeholder="Nama sumber berita"
                className="input-field"
              />
            </div>

            {/* Tanggal Publish */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
                Tanggal Publish <span className="text-rose-400">*</span>
              </label>
              <input
                required
                type="datetime-local"
                value={form.published_at}
                onChange={update("published_at")}
                className="input-field"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
                Kategori <span className="text-rose-400">*</span>
              </label>
              <input
                required
                value={form.category}
                onChange={update("category")}
                placeholder="general, teknologi, dll"
                className="input-field"
              />
            </div>

            {/* URL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
                URL <span className="text-rose-400">*</span>
              </label>
              <input
                required
                value={form.url}
                onChange={update("url")}
                placeholder="https://..."
                className="input-field"
              />
            </div>

            {/* Deskripsi (full width) */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#A3AED0]">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={update("description")}
                rows={4}
                placeholder="Ringkasan singkat berita..."
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* ── Footer Actions ─────────────────────────────── */}
          <div className="mt-6 flex justify-end gap-3 border-t border-[#E6E8F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-press rounded-xl border border-[#E6E8F0] bg-white px-5 py-2.5 text-sm font-medium text-[#A3AED0] transition-colors duration-150 hover:bg-[#F4F7FE]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-press bg-[#4318FF] hover:bg-[#3311DB] text-white rounded-xl px-5 py-3 font-medium transition-all active:scale-95"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
