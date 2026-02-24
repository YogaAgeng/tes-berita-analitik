import {
  createNews,
  deleteNews,
  getDashboardAnalytics,
  getLastSync,
  getNews,
  syncNews,
  updateNews,
} from "../services/news.service.js";

const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => !payload[field]);
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
};

export const listNewsHandler = async (req, res, next) => {
  try {
    const rows = await getNews(req.query);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createNewsHandler = async (req, res, next) => {
  try {
    requireFields(req.body, ["title", "source", "published_at", "category", "url"]);
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
    const result = await syncNews();
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
