CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(100) NOT NULL,
  published_at DATETIME NOT NULL,
  category VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_published_at ON news (published_at);
CREATE INDEX idx_news_category ON news (category);
CREATE INDEX idx_news_created_at ON news (created_at);

CREATE TABLE IF NOT EXISTS trending_keywords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  frequency INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_keyword_category (keyword, category)
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_inserted INT NOT NULL DEFAULT 0,
  source_endpoint VARCHAR(100) NULL,
  query_used VARCHAR(255) NULL
);
