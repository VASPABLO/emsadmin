<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        respondJson(["error" => "Método no permitido"], 405);
    }

    // Solo los pedidos internos facturados tienen costo capturado (se graba al momento
    // de facturar, ver pedidoPut.php), así que son la única fuente confiable de ganancia real.
    $sql = "SELECT idPedido, facturadoAt, productos FROM pedidos
            WHERE origen = 'interno' AND estado = 'Facturado' AND facturadoAt IS NOT NULL
            ORDER BY facturadoAt ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $pedidosFacturados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $semanas = []; // clave "YYYY-Www" => datos de la semana

    foreach ($pedidosFacturados as $pedido) {
        $fecha = new DateTime($pedido['facturadoAt']);
        $inicioSemana = (clone $fecha)->modify('monday this week');
        $finSemana = (clone $inicioSemana)->modify('+6 days');
        $clave = $inicioSemana->format('Y-m-d');

        if (!isset($semanas[$clave])) {
            $semanas[$clave] = [
                'inicio' => $inicioSemana->format('Y-m-d'),
                'fin' => $finSemana->format('Y-m-d'),
                'ventas' => 0.0,
                'costo' => 0.0,
                'ganancia' => 0.0,
                'pedidos' => 0,
            ];
        }

        $lineas = json_decode($pedido['productos'], true) ?: [];
        foreach ($lineas as $linea) {
            $cantidad = (float) ($linea['cantidad'] ?? 0);
            $precio = (float) ($linea['precio'] ?? 0);
            $costoUnitario = (float) ($linea['costoUnitario'] ?? 0);

            $semanas[$clave]['ventas'] += $precio * $cantidad;
            $semanas[$clave]['costo'] += $costoUnitario * $cantidad;
            $semanas[$clave]['ganancia'] += ($precio - $costoUnitario) * $cantidad;
        }

        $semanas[$clave]['pedidos']++;
    }

    ksort($semanas);
    $semanas = array_values($semanas);

    // Últimas 8 semanas con datos, para no devolver un historial interminable.
    $semanas = array_slice($semanas, -8);

    $hoy = new DateTime();
    $inicioSemanaActual = (clone $hoy)->modify('monday this week')->format('Y-m-d');
    $semanaActual = null;
    foreach ($semanas as $semana) {
        if ($semana['inicio'] === $inicioSemanaActual) {
            $semanaActual = $semana;
            break;
        }
    }
    if (!$semanaActual) {
        $finSemanaActual = (clone $hoy)->modify('monday this week')->modify('+6 days')->format('Y-m-d');
        $semanaActual = [
            'inicio' => $inicioSemanaActual,
            'fin' => $finSemanaActual,
            'ventas' => 0.0,
            'costo' => 0.0,
            'ganancia' => 0.0,
            'pedidos' => 0,
        ];
    }

    respondJson([
        "semanas" => $semanas,
        "semanaActual" => $semanaActual,
    ]);
} catch (PDOException $error) {
    respondJson(["error" => "Error de conexión: " . $error->getMessage()], 500);
} catch (Throwable $error) {
    respondJson(["error" => "Error inesperado: " . $error->getMessage()], 500);
}
