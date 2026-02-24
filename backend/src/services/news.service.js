import axios from "axios";
import { db } from "../lib/db.js";
import { STOP_WORDS } from "../lib/stopWords.js";

const NEWS_FIELDS =
  "id, title, description, source, published_at, category, url, created_at";

const normalizeDateRange = (from, to) => {
  if (!from && !to) {
    return null;
  }

  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;

  if (start && Number.isNaN(start.getTime())) {
    throw new Error("Invalid from date");
  }

  if (end && Number.isNaN(end.getTime())) {
    throw new Error("Invalid to date");
  }

  return { start, end };
};

export const getNews = async ({
  search,
  category,
  sortBy = "published_at",
  order = "DESC",
  from,
  to,
}) => {
  const allowedSort = new Set(["published_at", "created_at", "title", "category"]);
  const safeSortBy = allowedSort.has(sortBy) ? sortBy : "published_at";
  const safeOrder = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const where = [];
  const params = [];

  if (search) {
    where.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    where.push("category = ?");
    params.push(category);
  }

  const range = normalizeDateRange(from, to);
  if (range?.start) {
    where.push("published_at >= ?");
    params.push(range.start);
  }
  if (range?.end) {
    where.push("published_at <= ?");
    params.push(range.end);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `SELECT ${NEWS_FIELDS} FROM news ${whereClause} ORDER BY ${safeSortBy} ${safeOrder}`,
    params,
  );

  return rows;
};

export const createNews = async (payload) => {
  const { title, description, source, published_at, category, url } = payload;
  const [result] = await db.query(
    `INSERT INTO news (title, description, source, published_at, category, url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, source, published_at, category, url],
  );

  const [rows] = await db.query(`SELECT ${NEWS_FIELDS} FROM news WHERE id = ?`, [result.insertId]);
  return rows[0];
};

export const updateNews = async (id, payload) => {
  const { title, description, source, published_at, category, url } = payload;

  await db.query(
    `UPDATE news
     SET title = ?, description = ?, source = ?, published_at = ?, category = ?, url = ?
     WHERE id = ?`,
    [title, description, source, published_at, category, url, id],
  );

  const [rows] = await db.query(`SELECT ${NEWS_FIELDS} FROM news WHERE id = ?`, [id]);
  return rows[0] || null;
};

export const deleteNews = async (id) => {
  const [result] = await db.query("DELETE FROM news WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const cleanWord = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

const extractKeywords = (articles) => {
  const keywordMap = new Map();

  articles.forEach((article) => {
    const title = article.title || "";
    const words = cleanWord(title).split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      if (word.length < 3 || STOP_WORDS.has(word)) {
        return;
      }
      const category = article.category || "general";
      const key = `${word}::${category}`;
      keywordMap.set(key, (keywordMap.get(key) || 0) + 1);
    });
  });

  return keywordMap;
};

const persistTrendingKeywords = async (keywordMap) => {
  if (!keywordMap.size) {
    return;
  }

  const values = Array.from(keywordMap.entries()).map(([key, frequency]) => {
    const [keyword, category] = key.split("::");
    return [keyword, category, frequency];
  });

  const placeholders = values.map(() => "(?, ?, ?)").join(",");
  const params = values.flat();

  await db.query(
    `INSERT INTO trending_keywords (keyword, category, frequency)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       frequency = frequency + VALUES(frequency),
       last_updated = CURRENT_TIMESTAMP`,
    params,
  );
};

const fetchExternalNews = async () => {
  const baseUrl = process.env.NEWS_API_BASE_URL;
  const apiKey = process.env.NEWS_API_KEY;
  const country = process.env.NEWS_API_COUNTRY || "id";
  const pageSize = Number(process.env.NEWS_API_PAGE_SIZE || 50);
  const categories = (process.env.NEWS_API_CATEGORIES || "general")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!baseUrl || !apiKey) {
    throw new Error("News API configuration is missing");
  }

  const responses = await Promise.all(
    categories.map((category) =>
      axios.get(baseUrl, {
        params: {
          apiKey,
          country,
          category,
          pageSize,
        },
      }),
    ),
  );

  return responses
    .flatMap((response, index) => {
      const category = categories[index] || "general";
      const articles = response.data?.articles || [];
      return articles.map((item) => ({
        title: item.title || "Untitled",
        description: item.description || "",
        source: item.source?.name || "Unknown",
        published_at: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        category,
        url: item.url,
      }));
    })
    .filter((item) => item.url);
};

export const syncNews = async () => {
  const fetchedArticles = await fetchExternalNews();
  const uniqueArticles = Array.from(
    new Map(fetchedArticles.map((article) => [article.url, article])).values(),
  );

  if (!uniqueArticles.length) {
    await db.query("INSERT INTO sync_logs (total_inserted) VALUES (0)");
    return { inserted: 0 };
  }

  const urlPlaceholders = uniqueArticles.map(() => "?").join(",");
  const [existingRows] = await db.query(
    `SELECT url FROM news WHERE url IN (${urlPlaceholders})`,
    uniqueArticles.map((article) => article.url),
  );
  const existingUrls = new Set(existingRows.map((row) => row.url));
  const articles = uniqueArticles.filter((article) => !existingUrls.has(article.url));

  if (!articles.length) {
    await db.query("INSERT INTO sync_logs (total_inserted) VALUES (0)");
    return { inserted: 0 };
  }

  const placeholders = articles.map(() => "(?, ?, ?, ?, ?, ?)").join(",");
  const params = articles.flatMap((article) => [
    article.title,
    article.description,
    article.source,
    article.published_at,
    article.category,
    article.url,
  ]);

  const [result] = await db.query(
    `INSERT IGNORE INTO news (title, description, source, published_at, category, url)
     VALUES ${placeholders}`,
    params,
  );

  await db.query("INSERT INTO sync_logs (total_inserted) VALUES (?)", [result.affectedRows || 0]);
  const keywords = extractKeywords(articles);
  await persistTrendingKeywords(keywords);

  return { inserted: result.affectedRows || 0 };
};

export const getDashboardAnalytics = async ({ from, to }) => {
  const range = normalizeDateRange(from, to);
  const where = [];
  const params = [];

  if (range?.start) {
    where.push("published_at >= ?");
    params.push(range.start);
  }
  if (range?.end) {
    where.push("published_at <= ?");
    params.push(range.end);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [[totals]] = await db.query(
    `SELECT COUNT(*) AS totalNews FROM news ${whereClause}`,
    params,
  );

  const [categoryRows] = await db.query(
    `SELECT category, COUNT(*) AS total
     FROM news
     ${whereClause}
     GROUP BY category
     ORDER BY total DESC`,
    params,
  );

  const [dailyRows] = await db.query(
    `SELECT DATE(published_at) AS date, COUNT(*) AS total
     FROM news
     ${whereClause}
     GROUP BY DATE(published_at)
     ORDER BY DATE(published_at) ASC`,
    params,
  );

  const [[lastSyncRow]] = await db.query(
    "SELECT synced_at, total_inserted FROM sync_logs ORDER BY synced_at DESC LIMIT 1",
  );

  const [trendingRows] = await db.query(
    `SELECT keyword, category, frequency, last_updated
     FROM trending_keywords
     ORDER BY frequency DESC, last_updated DESC
     LIMIT 20`,
  );

  return {
    totalNews: totals.totalNews,
    topCategory: categoryRows[0]?.category || "-",
    lastSync: lastSyncRow || null,
    byCategory: categoryRows,
    byDay: dailyRows,
    trendingTopics: trendingRows,
  };
};

export const getLastSync = async () => {
  const [[row]] = await db.query(
    "SELECT synced_at, total_inserted FROM sync_logs ORDER BY synced_at DESC LIMIT 1",
  );
  return row || null;
};
