import { memo } from "react";
import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="skeleton mb-2 h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </td>
      <td className="px-4 py-3">
        <div className="skeleton h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <div className="skeleton h-6 w-16 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="skeleton h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="skeleton h-7 w-12 rounded-lg" />
          <div className="skeleton h-7 w-14 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

function NewsTableSection({
  loading,
  news,
  pagination,
  page,
  onPageChange,
  onEdit,
  onDelete,
  formatDateTime,
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 pt-1 pb-3 text-left text-sm font-medium text-[#A3AED0] border-b border-[#E6E8F0]">Judul</th>
              <th className="px-6 pt-1 pb-3 text-left text-sm font-medium text-[#A3AED0] border-b border-[#E6E8F0]">Sumber</th>
              <th className="px-6 pt-1 pb-3 text-left text-sm font-medium text-[#A3AED0] border-b border-[#E6E8F0]">Kategori</th>
              <th className="px-6 pt-1 pb-3 text-left text-sm font-medium text-[#A3AED0] border-b border-[#E6E8F0]">Published</th>
              <th className="px-6 pt-1 pb-3 text-left text-sm font-medium text-[#A3AED0] border-b border-[#E6E8F0]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={`skel-${i}`} />
              ))
            ) : news.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-medium text-[#A3AED0]">
                  Tidak ada data berita
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id} className="border-b border-[#EEF1F7] align-top transition-colors hover:bg-[#F9FAFF]">
                  <td className="px-6 py-5">
                    <p className="max-w-lg font-semibold text-[#2B3674]">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-[#A3AED0]">{item.description || "-"}</p>
                  </td>
                  <td className="px-6 py-5 font-medium text-[#2B3674]">{item.source}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center rounded-full bg-[#EBE5FF] px-2.5 py-0.5 text-xs font-medium capitalize text-[#4318FF]">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-[#A3AED0]">{formatDateTime(item.published_at)}</td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#2B3674] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1F285C]"
                      >
                        <RiEditLine className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#A3AED0] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#8E9CC7]"
                      >
                        <RiDeleteBinLine className="h-4 w-4" />
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

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-medium text-[#A3AED0]">
            Halaman {pagination.page} dari {pagination.totalPages} • Total {pagination.total} data
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-[#E6E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#2B3674] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-[#E6E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#2B3674] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(NewsTableSection);
