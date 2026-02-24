import { useEffect, useState } from "react";

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
    if (!open) {
      return;
    }

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

  if (!open) {
    return null;
  }

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      published_at: new Date(form.published_at).toISOString().slice(0, 19).replace("T", " "),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? "Edit Berita" : "Tambah Berita"}
          </h2>
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            Tutup
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Judul"
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={form.source}
            onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
            placeholder="Sumber"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            type="datetime-local"
            value={form.published_at}
            onChange={(e) => setForm((prev) => ({ ...prev, published_at: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="Kategori"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={form.url}
            onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="URL"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="Deskripsi"
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2"
          />

          <div className="col-span-2 mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
