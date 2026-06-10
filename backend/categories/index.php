<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

$user   = requireSession();
$method = $_SERVER['REQUEST_METHOD'];
$pdo    = getDB();

// ── GET /categories/?tipo=gasto|ingreso ──────────────────────
if ($method === 'GET') {
    $tipo = $_GET['tipo'] ?? null;
    if (!in_array($tipo, ['gasto','ingreso'])) {
        jsonError('Tipo inválido (gasto|ingreso)');
    }
    $stmt = $pdo->prepare(
        'SELECT id, nombre, color FROM categorias
          WHERE usuario_id = ? AND tipo = ?
          ORDER BY creado_en ASC'
    );
    $stmt->execute([$user['id'], $tipo]);
    jsonOk($stmt->fetchAll());
}

// ── POST /categories/ ────────────────────────────────────────
if ($method === 'POST') {
    $body   = body();
    $nombre = trim($body['nombre'] ?? '');
    $color  = trim($body['color']  ?? '#808080');
    $tipo   = trim($body['tipo']   ?? '');

    if (!$nombre || !in_array($tipo, ['gasto','ingreso'])) {
        jsonError('Nombre y tipo son requeridos');
    }
    if (mb_strlen($nombre) > 14) {
        jsonError('El nombre no puede tener más de 14 letras');
    }

    $count = $pdo->prepare('SELECT COUNT(*) FROM categorias WHERE usuario_id = ? AND tipo = ?');
    $count->execute([$user['id'], $tipo]);
    if ((int)$count->fetchColumn() >= 8) {
        jsonError('Límite máximo de 8 categorías alcanzado');
    }

    $dup = $pdo->prepare('SELECT id FROM categorias WHERE usuario_id = ? AND nombre = ? AND tipo = ?');
    $dup->execute([$user['id'], $nombre, $tipo]);
    if ($dup->fetch()) {
        jsonError('La categoría ya se encuentra registrada');
    }

    $ins = $pdo->prepare('INSERT INTO categorias (usuario_id, nombre, color, tipo) VALUES (?, ?, ?, ?)');
    $ins->execute([$user['id'], $nombre, $color, $tipo]);
    jsonOk(['id' => $pdo->lastInsertId(), 'nombre' => $nombre, 'color' => $color], 201);
}

// ── PUT /categories/?id=X ────────────────────────────────────
if ($method === 'PUT') {
    $id     = (int)($_GET['id'] ?? 0);
    $body   = body();
    $nombre = trim($body['nombre'] ?? '');
    $color  = trim($body['color']  ?? '#808080');

    if (!$id || !$nombre) jsonError('ID y nombre son requeridos');
    if (mb_strlen($nombre) > 14) jsonError('El nombre no puede tener más de 14 letras');

    $own = $pdo->prepare('SELECT tipo FROM categorias WHERE id = ? AND usuario_id = ?');
    $own->execute([$id, $user['id']]);
    $cat = $own->fetch();
    if (!$cat) jsonError('Categoría no encontrada', 404);

    $dup = $pdo->prepare('SELECT id FROM categorias WHERE usuario_id = ? AND nombre = ? AND tipo = ? AND id != ?');
    $dup->execute([$user['id'], $nombre, $cat['tipo'], $id]);
    if ($dup->fetch()) jsonError('La categoría ya se encuentra registrada');

    $upd = $pdo->prepare('UPDATE categorias SET nombre = ?, color = ? WHERE id = ?');
    $upd->execute([$nombre, $color, $id]);
    jsonOk(['id' => $id, 'nombre' => $nombre, 'color' => $color]);
}

// ── DELETE /categories/?id=X ─────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('ID requerido');

    $own = $pdo->prepare('SELECT id FROM categorias WHERE id = ? AND usuario_id = ?');
    $own->execute([$id, $user['id']]);
    if (!$own->fetch()) jsonError('Categoría no encontrada', 404);

    $del = $pdo->prepare('DELETE FROM categorias WHERE id = ? AND usuario_id = ?');
    $del->execute([$id, $user['id']]);
    jsonOk(['eliminado' => true]);
}

jsonError('Método no permitido', 405);
