<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

$user = requireSession();
$pdo  = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Método no permitido', 405);

$stmt = $pdo->prepare(
    'SELECT tipo, COALESCE(SUM(valor),0) AS total
       FROM transacciones
      WHERE usuario_id = ?
        AND YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY tipo'
);
$stmt->execute([$user['id']]);
$rows = $stmt->fetchAll();

$totalGastos   = 0;
$totalIngresos = 0;
foreach ($rows as $r) {
    if ($r['tipo'] === 'gasto')   $totalGastos   = (float)$r['total'];
    if ($r['tipo'] === 'ingreso') $totalIngresos = (float)$r['total'];
}

jsonOk([
    'total_gastos'   => $totalGastos,
    'total_ingresos' => $totalIngresos,
    'disponible'     => $totalIngresos - $totalGastos,
]);
