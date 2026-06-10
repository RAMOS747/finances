<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

$user = requireSession();
$pdo  = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método no permitido', 405);
}

$lunesActual   = date('Y-m-d', strtotime('monday this week'));
$domingoActual = date('Y-m-d', strtotime('sunday this week'));

$stmtGastos = $pdo->prepare(
    'SELECT c.nombre, c.color, COALESCE(SUM(t.valor), 0) AS total
       FROM categorias c
       LEFT JOIN transacciones t
              ON t.categoria_id = c.id
             AND t.fecha BETWEEN ? AND ?
      WHERE c.usuario_id = ? AND c.tipo = \'gasto\'
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC'
);
$stmtGastos->execute([$lunesActual, $domingoActual, $user['id']]);
$datosGastos = $stmtGastos->fetchAll();

$stmtIngresos = $pdo->prepare(
    'SELECT c.nombre, c.color, COALESCE(SUM(t.valor), 0) AS total
       FROM categorias c
       LEFT JOIN transacciones t
              ON t.categoria_id = c.id
             AND t.fecha BETWEEN ? AND ?
      WHERE c.usuario_id = ? AND c.tipo = \'ingreso\'
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC'
);
$stmtIngresos->execute([$lunesActual, $domingoActual, $user['id']]);
$datosIngresos = $stmtIngresos->fetchAll();

$diasSemana = [];
for ($i = 0; $i < 7; $i++) {
    $diasSemana[] = date('Y-m-d', strtotime($lunesActual . " +{$i} days"));
}

function rellenarSemana(array $filas, array $dias): array {
    $mapa = [];
    foreach ($filas as $f) {
        $mapa[$f['fecha']] = (float) $f['total'];
    }
    $resultado = [];
    foreach ($dias as $fecha) {
        $resultado[] = ['fecha' => $fecha, 'total' => $mapa[$fecha] ?? 0];
    }
    return $resultado;
}

$stmtGastosDia = $pdo->prepare(
    'SELECT DATE(t.fecha) AS fecha,
            COALESCE(SUM(t.valor), 0) AS total
       FROM transacciones t
      WHERE t.usuario_id = ?
        AND t.tipo = \'gasto\'
        AND t.fecha BETWEEN ? AND ?
      GROUP BY DATE(t.fecha)
      ORDER BY fecha ASC'
);
$stmtGastosDia->execute([$user['id'], $lunesActual, $domingoActual]);
$gastosPorDia = rellenarSemana($stmtGastosDia->fetchAll(), $diasSemana);

$stmtIngresosDia = $pdo->prepare(
    'SELECT DATE(t.fecha) AS fecha,
            COALESCE(SUM(t.valor), 0) AS total
       FROM transacciones t
      WHERE t.usuario_id = ?
        AND t.tipo = \'ingreso\'
        AND t.fecha BETWEEN ? AND ?
      GROUP BY DATE(t.fecha)
      ORDER BY fecha ASC'
);
$stmtIngresosDia->execute([$user['id'], $lunesActual, $domingoActual]);
$ingresosPorDia = rellenarSemana($stmtIngresosDia->fetchAll(), $diasSemana);

$totalGastos   = array_sum(array_column($datosGastos,   'total'));
$totalIngresos = array_sum(array_column($datosIngresos, 'total'));
$disponible    = $totalIngresos - $totalGastos;

jsonOk([
    'gastos'           => $datosGastos,
    'ingresos'         => $datosIngresos,
    'gastos_por_dia'   => $gastosPorDia,
    'ingresos_por_dia' => $ingresosPorDia,
    'total_gastos'     => $totalGastos,
    'total_ingresos'   => $totalIngresos,
    'disponible'       => $disponible,
    'semana'           => ['desde' => $lunesActual, 'hasta' => $domingoActual],
]);
