-- CRM schema: customers and history (per TASKOVERVIEW section 8)
-- Run this once to create the database and tables (e.g. via db/init.js or manually).

CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

-- customers: basic customer info
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- history: customer history entries (appointments, services, other)
-- art = 'appointment' => visible in Appointment List until completed; all arts visible in History tab
-- completed: when true, appointment is excluded from Appointment List but still in History
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
