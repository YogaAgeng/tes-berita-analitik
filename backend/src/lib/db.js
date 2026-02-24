import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "news_analytics",
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = pool;

export const testConnection = async () => {
  const connection = await db.getConnection();
  await connection.ping();
  connection.release();
};
