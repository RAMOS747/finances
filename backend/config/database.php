<?php
$url = parse_url(getenv('MYSQL_URL'));

define('DB_HOST', $url['host']);
define('DB_USER', $url['user']);
define('DB_PASS', $url['pass']);
define('DB_NAME', ltrim($url['path'], '/'));
define('DB_PORT', $url['port'] ?? 3306);

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "ok" => false, 
                "error" => "Error de conexión: " . $e->getMessage()
            ]);
            exit();
        }
    }
    return $pdo;
}