<?php
// ── Helpers ──────────────────────────────────────────────────
function jsonOk(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

function jsonError(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function requireSession(): array {
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_httponly', '1');
    session_start();
    if (empty($_SESSION['user_id'])) {
        jsonError('No autenticado', 401);
    }
    return ['id' => $_SESSION['user_id'], 'nombre' => $_SESSION['nombre']];
}
