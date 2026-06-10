<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

$user   = requireSession();
$method = $_SERVER['REQUEST_METHOD'];
$pdo    = getDB();

// ── GET /transactions/?tipo=gasto|ingreso ────────────────────
if ($method === 'GET') {
    $tipo = $_GET['tipo'] ?? null;
    if (!in_array($tipo, ['gasto','ingreso'])) jsonError('Tipo inválido');

    $stmt = $pdo->prepare(
        'SELECT t.id, t.valor, t.fecha, t.comentario,
                c.nombre AS categoria, c.color AS categoria_color
           FROM transacciones t
           JOIN categorias c ON c.id = t.categoria_id
          WHERE t.usuario_id = ? AND t.tipo = ?
          ORDER BY t.fecha DESC, t.creado_en DESC'
    );
    $stmt->execute([$user['id'], $tipo]);
    jsonOk($stmt->fetchAll());
}

// ── POST /transactions/ ──────────────────────────────────────
if ($method === 'POST') {
    $body         = body();
    $categoria_id = (int)($body['categoria_id'] ?? 0);
    $valor        = (float)($body['valor']       ?? 0);
    $fecha        = trim($body['fecha']           ?? '');
    $comentario   = trim($body['comentario']      ?? '');
    $tipo         = trim($body['tipo']            ?? '');

    if (!$categoria_id || $valor <= 0 || !$fecha || !in_array($tipo, ['gasto','ingreso'])) {
        jsonError('Valor, fecha y categoría son requeridos');
    }

    $own = $pdo->prepare('SELECT id FROM categorias WHERE id = ? AND usuario_id = ? AND tipo = ?');
    $own->execute([$categoria_id, $user['id'], $tipo]);
    if (!$own->fetch()) jsonError('Categoría inválida', 404);

    $ins = $pdo->prepare(
        'INSERT INTO transacciones (usuario_id, categoria_id, valor, fecha, comentario, tipo)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([$user['id'], $categoria_id, $valor, $fecha, $comentario, $tipo]);
    jsonOk(['id' => $pdo->lastInsertId()], 201);
}

// ── DELETE /transactions/?id=X ───────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('ID requerido');

    $del = $pdo->prepare('DELETE FROM transacciones WHERE id = ? AND usuario_id = ?');
    $del->execute([$id, $user['id']]);
    if (!$del->rowCount()) jsonError('Transacción no encontrada', 404);

    jsonOk(['eliminado' => true]);
}

jsonError('Método no permitido', 405);
