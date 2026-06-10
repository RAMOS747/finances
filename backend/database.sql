-- ============================================================
--  FINANCES APP – Esquema de Base de Datos
-- ============================================================

-- ❌ ELIMINADO:
-- CREATE DATABASE
-- USE finances_db

-- ── Tabla de usuarios ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100)  NOT NULL,
    correo      VARCHAR(150)  NOT NULL UNIQUE,
    contrasena  VARCHAR(255)  NOT NULL,
    creado_en   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Categorías ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT          NOT NULL,
    nombre      VARCHAR(100) NOT NULL, -- ⚠️ aumenté de 10 a 100
    color       VARCHAR(7)   NOT NULL DEFAULT '#808080',
    tipo        ENUM('gasto','ingreso') NOT NULL,
    creado_en   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY uq_cat (usuario_id, nombre, tipo)
);

-- ── Transacciones ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transacciones (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   INT            NOT NULL,
    categoria_id INT            NOT NULL,
    valor        DECIMAL(15,2)  NOT NULL, -- ⚠️ mejor 2 decimales
    fecha        DATE           NOT NULL,
    comentario   TEXT,
    tipo         ENUM('gasto','ingreso') NOT NULL,
    creado_en    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)    ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)  ON DELETE CASCADE
);