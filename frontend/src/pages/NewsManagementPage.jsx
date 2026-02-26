import { useState } from "react";
import NewsFormModal from "../components/NewsFormModal.jsx";
import NewsFilterSyncSection from "../features/news/NewsFilterSyncSection.jsx";
import NewsTableSection from "../features/news/NewsTableSection.jsx";
import { useNewsManagement } from "../features/news/useNewsManagement.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID");
};

export default function NewsManagementPage({ renderSections }) {
  const { state, actions } = useNewsManagement();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
    const success = editingItem
      ? await actions.handleUpdate(editingItem.id, payload)
      : await actions.handleCreate(payload);

    if (success) {
      closeModal();
    }
  };

  const filterSection = (
    <NewsFilterSyncSection
      search={state.search}
      onSearchChange={actions.setSearch}
      category={state.category}
      categories={state.categories}
      onCategoryChange={actions.setCategory}
      onCreateClick={openCreateModal}
      syncTopic={state.syncTopic}
      onSyncTopicChange={actions.setSyncTopic}
      quickTopics={state.quickTopics}
      onQuickTopicClick={actions.setSyncTopic}
      lastSyncText={formatDateTime(state.lastSync?.synced_at)}
      syncing={state.syncing}
      onSync={actions.handleSync}
    />
  );

  const tableSection = (
    <>
      <NewsTableSection
        loading={state.loading}
        news={state.news}
        pagination={state.pagination}
        page={state.page}
        onPageChange={actions.setPage}
        onEdit={openEditModal}
        onDelete={actions.handleDelete}
        formatDateTime={formatDateTime}
      />
      <NewsFormModal
        open={modalOpen}
        initialData={editingItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );

  if (typeof renderSections === "function") {
    return renderSections({ filterSection, tableSection });
  }

  return (
    <section className="space-y-4">
      <div className="mb-6 rounded-[20px] border-none bg-white p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
        {filterSection}
      </div>

      <div className="overflow-hidden rounded-[20px] border-none bg-white p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
        {tableSection}
      </div>
    </section>
  );
}
