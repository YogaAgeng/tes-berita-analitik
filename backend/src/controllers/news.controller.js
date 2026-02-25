import {
  createNews,
  deleteNews,
  getDashboardAnalytics,
  getLastSync,
  getNews,
  syncNews,
  updateNews,
} from "../services/news.service.js";

const MAX_TEXT_LENGTH = 255;
const ALLOWED_SYNC_SORT = new Set(["relevancy", "popularity", "publishedAt"]);

const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isValidUrl = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
};

const ensureStringLength = (value, field, maxLength = MAX_TEXT_LENGTH) => {
  if (typeof value !== "string") {
    const error = new Error(`Field '${field}' must be a string`);
    error.status = 400;
    throw error;
  }

  if (!value.trim()) {
    const error = new Error(`Field '${field}' cannot be empty`);
    error.status = 400;
    throw error;
  }

  if (value.length > maxLength) {
    const error = new Error(`Field '${field}' exceeds max length (${maxLength})`);
    error.status = 400;
    throw error;
  }
};

const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => !payload[field]);
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
};

const validateNewsPayload = (payload) => {
  ensureStringLength(payload.title, "title");
  if (payload.description && typeof payload.description !== "string") {
    const error = new Error("Field 'description' must be a string");
    error.status = 400;
    throw error;
  }
  ensureStringLength(payload.source, "source", 100);
  ensureStringLength(payload.category, "category", 50);

  if (!isValidDate(payload.published_at)) {
    const error = new Error("Field 'published_at' must be a valid date");
    error.status = 400;
    throw error;
  }

  if (!isValidUrl(payload.url)) {
    const error = new Error("Field 'url' must be a valid URL");
    error.status = 400;
    throw error;
  }
};

const validateSyncQuery = (query) => {
  const topic = String(query.q ?? query.query ?? "").trim();
  if (!topic) {
    const error = new Error("Query topic is required. Use ?q=<topic> when syncing news.");
    error.status = 400;
    throw error;
  }

  if (topic.length > 120) {
    const error = new Error("Sync topic is too long (max 120 chars)");
    error.status = 400;
    throw error;
  }

  if (query.pageSize !== undefined) {
    const pageSize = Number(query.pageSize);
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      const error = new Error("pageSize must be an integer between 1 and 100");
      error.status = 400;
      throw error;
    }
  }

  if (query.language !== undefined && !/^[a-z]{2}$/i.test(String(query.language))) {
    const error = new Error("language must use 2-letter code, e.g. 'id' or 'en'");
    error.status = 400;
    throw error;
  }

  if (query.sortBy !== undefined && !ALLOWED_SYNC_SORT.has(String(query.sortBy))) {
    const error = new Error("sortBy must be one of: relevancy, popularity, publishedAt");
    error.status = 400;
    throw error;
  }
};

const validateListQuery = (query) => {
  if (query.page !== undefined) {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      const error = new Error("page must be an integer >= 1");
      error.status = 400;
      throw error;
    }
  }

  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      const error = new Error("limit must be an integer between 1 and 100");
      error.status = 400;
      throw error;
    }
  }
};

export const listNewsHandler = async (req, res, next) => {
  try {
    validateListQuery(req.query);
    const rows = await getNews(req.query);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createNewsHandler = async (req, res, next) => {
  try {
    requireFields(req.body, ["title", "source", "published_at", "category", "url"]);
    validateNewsPayload(req.body);
    const row = await createNews(req.body);
    res.status(201).json(row);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      error.status = 409;
      error.message = "News URL already exists";
    }
    next(error);
  }
};

export const updateNewsHandler = async (req, res, next) => {
  try {
    requireFields(req.body, ["title", "source", "published_at", "category", "url"]);
    validateNewsPayload(req.body);
    const row = await updateNews(Number(req.params.id), req.body);
    if (!row) {
      res.status(404).json({ message: "News not found" });
      return;
    }
    res.json(row);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      error.status = 409;
      error.message = "News URL already exists";
    }
    next(error);
  }
};

export const deleteNewsHandler = async (req, res, next) => {
  try {
    const deleted = await deleteNews(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: "News not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const syncNewsHandler = async (_req, res, next) => {
  try {
    validateSyncQuery(_req.query);
    const result = await syncNews(_req.query);
    const lastSync = await getLastSync();
    res.json({ ...result, lastSync });
  } catch (error) {
    next(error);
  }
};

export const dashboardHandler = async (req, res, next) => {
  try {
    const data = await getDashboardAnalytics(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const lastSyncHandler = async (_req, res, next) => {
  try {
    const data = await getLastSync();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
