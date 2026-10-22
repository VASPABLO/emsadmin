<?php
// Script de uso manual (una sola vez por entorno) para pasar los pedidos
// viejos a los tres estados nuevos: En proceso, Facturado y Cancelado.
//
// Abrilo desde el navegador estando logueado como admin:
//   local      -> http://localhost:8081/emsadmin/backend/setup/migrarEstadosPedidos.php
//   producción -> https://emscrsoluciones.com/setup/migrarEstadosPedidos.php
//
// Sin ?aplicar=1 solo muestra lo que haría (simulación). Con ?aplicar=1 escribe.
//
// No descuenta stock de los pedidos viejos: esa mercadería ya salió, y
// descontarla ahora dejaría el inventario mal.

require __DIR__ . '/../config/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');

requireRole(['admin']);

$MAPA = [
    'pendiente' => 'En proceso',
    'recibido' => 'En proceso',
    'en proceso' => 'En proceso',
    'pagado' => 'Facturado',
    'entregado' => 'Facturado',
    'facturado' => 'Facturado',
    'rechazado' => 'Cancelado',
    'cancelado' => 'Cancelado',
];

$aplicar = isset($_GET['aplicar']) && $_GET['aplicar'] === '1';

echo '<meta charset="utf-8"><style>body{font-family:system-ui;padding:2rem;line-height:1.6}'
    . 'table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:.4rem .8rem;text-align:left}</style>';
echo '<h2>Migración de estados de pedidos</h2>';
echo $aplicar
    ? '<p><strong>Modo: aplicando cambios.</strong></p>'
    : '<p><strong>Modo: simulación.</strong> Agregá <code>?aplicar=1</code> a la URL para escribir los cambios.</p>';

try {
    $actuales = $conexion->query('SELECT estado, COUNT(*) AS n FROM pedidos GROUP BY estado')->fetchAll(PDO::FETCH_ASSOC);

    echo '<table><tr><th>Estado actual</th><th>Pedidos</th><th>Pasa a</th></tr>';

    $sinMapear = [];
    $porNuevoEstado = [];

    foreach ($actuales as $fila) {
        $estado = (string) $fila['estado'];
        $clave = strtolower(trim($estado));
        $destino = $MAPA[$clave] ?? null;

        if ($destino === null) {
            $sinMapear[] = $estado;
        } elseif ($destino !== $estado) {
            $porNuevoEstado[$destino][] = $estado;
        }

        echo '<tr><td>' . htmlspecialchars($estado) . '</td><td>' . (int) $fila['n'] . '</td><td>'
            . htmlspecialchars($destino ?? 'SIN MAPEAR') . ($destino === $estado ? ' (sin cambios)' : '')
            . '</td></tr>';
    }

    echo '</table>';

    if ($sinMapear !== []) {
        echo '<p style="color:#b45309"><strong>Atención:</strong> estos estados no están en el mapa y quedarían como están: '
            . htmlspecialchars(implode(', ', $sinMapear))
            . '. Agregalos al array $MAPA de este archivo antes de aplicar.</p>';
    }

    if ($porNuevoEstado === []) {
        echo '<p>No hay nada que migrar: todos los pedidos ya usan los estados nuevos.</p>';
        exit;
    }

    if (!$aplicar) {
        exit;
    }

    $conexion->beginTransaction();
    $total = 0;

    $stmt = $conexion->prepare('UPDATE pedidos SET estado = :nuevo WHERE LOWER(TRIM(estado)) = :viejo');

    foreach ($porNuevoEstado as $nuevo => $viejos) {
        foreach ($viejos as $viejo) {
            $stmt->execute([':nuevo' => $nuevo, ':viejo' => strtolower(trim($viejo))]);
            $afectados = $stmt->rowCount();
            $total += $afectados;
            echo '<p>' . htmlspecialchars($viejo) . ' → ' . htmlspecialchars($nuevo) . ': ' . $afectados . ' pedidos</p>';
        }
    }

    $conexion->commit();

    echo '<p><strong>Listo: ' . $total . ' pedidos migrados.</strong> Este script ya no hace falta;'
        . ' si lo volvés a correr no cambia nada.</p>';
} catch (PDOException $error) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }

    echo '<p style="color:#b91c1c">Error: ' . htmlspecialchars($error->getMessage()) . '. No se migró nada.</p>';
}
