<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$body     = body();
$nombre   = trim($body['nombre']     ?? '');
$password = trim($body['contrasena'] ?? '');
$correo   = trim($body['correo']     ?? '');

if (!$nombre || !$password || !$correo) {
    jsonError('Todos los campos son requeridos');
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    jsonError('Formato de correo inválido');
}

$pdo  = getDB();
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ?');
$stmt->execute([$correo]);

if ($stmt->fetch()) {
    jsonError('El correo ya se encuentra registrado, ingrese uno diferente.');
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$ins  = $pdo->prepare('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)');
$ins->execute([$nombre, $correo, $hash]);

jsonOk(['mensaje' => 'Registro exitoso, ya puede iniciar sesión'], 201);
