CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  subject VARCHAR(500),
  art VARCHAR(50) NOT NULL COMMENT "appointment | service | other",
  description TEXT,
  date DATE,
  time TIME,
  created_by VARCHAR(255) NOT NULL COMMENT "ZITADEL sub (user id) for ownership",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed TINYINT(1) DEFAULT 0 NOT NULL COMMENT "1 = marked completed, exclude from appointment list",
  CONSTRAINT fk_history_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_history_customer_art (customer_id, art),
  INDEX idx_history_created_by (created_by),
  INDEX idx_history_completed (completed)
);
