CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NULL,
  updated_at  DATETIME     NULL,
  deleted_at  DATETIME     NULL
);

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  phone       VARCHAR(30)  NULL,
  password    VARCHAR(255) NOT NULL,
  avatar      VARCHAR(500) NULL,
  verified_at DATETIME     NULL,
  created_at  DATETIME     NULL,
  updated_at  DATETIME     NULL,
  deleted_at  DATETIME     NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS verifications (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  value       VARCHAR(20)  NOT NULL,
  created_at  DATETIME     NULL,
  updated_at  DATETIME     NULL,
  INDEX idx_verifications_email (email)
);

INSERT INTO roles (id, name, created_at, updated_at) VALUES
  (1, 'admin', NOW(), NOW()),
  (2, 'tutor', NOW(), NOW()),
  (3, 'user',  NOW(), NOW());

