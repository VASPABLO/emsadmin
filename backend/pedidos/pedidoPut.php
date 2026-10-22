<?php
// Cambio de estado de un pedido (módulo de cajas).
//
// El flujo tiene tres estados y uno solo mueve inventario:
//
//   En proceso  -> el pedido está abierto, no toca stock
//   Facturado   -> descuenta del stock y congela el costo de cada línea
//   Cancelado   -> cerrado sin venta
//
// Volver atrás desde Facturado (a Cancelado o a En proceso) devuelve al
// inventario lo que se había descontado, así el stock no se desfasa cuando se
// corrige una factura. Aplica igual para pedidos de la web y del vendedor.

require __DIR__ . '/../config/bootstrap.php';

requireRole(['cajera', 'admin']);

const ESTADOS_VALIDOS = ['En proceso', 'Facturado', 'Cancelado'];

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    respondJson(['error' => 'Método no permitido'], 405);
}

$idPedido = isset($_GET['idPedido']) ? (int) $_GET['idPedido'] : 0;
$datos = json_decode(file_get_contents('php://input'), true);
$nuevoEstado = isset($datos['estado']) ? trim((string) $datos['estado']) : '';

if ($idPedido <= 0 || $nuevoEstado === '') {
    respondJson(['error' => 'ID de pedido o estado no proporcionado'], 400);
}

if (!in_array($nuevoEstado, ESTADOS_VALIDOS, true)) {
    respondJson(['error' => 'Estado no válido. Solo se admite: ' . implode(', ', ESTADOS_VALIDOS)], 400);
}

/**
 * Suma las cantidades por producto: un mismo producto puede venir en más de
 * una línea del pedido y el stock se tiene que mover una sola vez.
 */
function cantidadesPorProducto(?string $productosJson): array
{
    $lineas = json_decode((string) $productosJson, true) ?: [];
    $cantidades = [];

    foreach ($lineas as $linea) {
        $idProducto = isset($linea['idProducto']) ? (int) $linea['idProducto'] : 0;
        $cantidad = isset($linea['cantidad']) ? (int) $linea['cantidad'] : 0;

        if ($idProducto > 0 && $cantidad > 0) {
            $cantidades[$idProducto] = ($cantidades[$idProducto] ?? 0) + $cantidad;
        }
    }

    return $cantidades;
}

try {
    $conexion->beginTransaction();

    // FOR UPDATE: bloquea el pedido hasta terminar, para que dos cajeras no
    // puedan facturarlo a la vez y descontar el stock dos veces.
    $stmtPedido = $conexion->prepare('SELECT estado, productos FROM pedidos WHERE idPedido = :idPedido FOR UPDATE');
    $stmtPedido->execute([':idPedido' => $idPedido]);
    $pedido = $stmtPedido->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        $conexion->rollBack();
        respondJson(['error' => 'Pedido no encontrado'], 404);
    }

    $estadoActual = (string) $pedido['estado'];
    $facturar = $nuevoEstado === 'Facturado' && $estadoActual !== 'Facturado';
    $revertir = $estadoActual === 'Facturado' && $nuevoEstado !== 'Facturado';
    $cantidades = ($facturar || $revertir) ? cantidadesPorProducto($pedido['productos']) : [];

    // Productos involucrados, bloqueados mientras dure la transacción.
    $productos = [];
    if ($cantidades !== []) {
        $marcadores = implode(',', array_fill(0, count($cantidades), '?'));
        $stmtProductos = $conexion->prepare(
            "SELECT idProducto, titulo, stock, costo FROM productos WHERE idProducto IN ($marcadores) FOR UPDATE"
        );
        $stmtProductos->execute(array_keys($cantidades));

        foreach ($stmtProductos->fetchAll(PDO::FETCH_ASSOC) as $producto) {
            $productos[(int) $producto['idProducto']] = $producto;
        }
    }

    $movimientos = [];

    if ($facturar) {
        // Se controla el stock antes de tocar nada: si falta uno solo, no se
        // factura. Los productos sin stock cargado (NULL) no se controlan ni se
        // descuentan: se consideran no inventariados.
        $faltantes = [];

        foreach ($cantidades as $idProducto => $cantidad) {
            $producto = $productos[$idProducto] ?? null;

            if ($producto === null) {
                $faltantes[] = "El producto #$idProducto ya no existe en el catálogo";
                continue;
            }

            if ($producto['stock'] !== null && (int) $producto['stock'] < $cantidad) {
                $faltantes[] = sprintf(
                    '%s: pedidas %d, disponibles %d',
                    $producto['titulo'],
                    $cantidad,
                    (int) $producto['stock']
                );
            }
        }

        if ($faltantes !== []) {
            $conexion->rollBack();
            respondJson([
                'error' => 'No se puede facturar por falta de stock',
                'faltantes' => $faltantes,
            ], 409);
        }

        $stmtDescontar = $conexion->prepare(
            'UPDATE productos SET stock = stock - :cantidad WHERE idProducto = :idProducto AND stock IS NOT NULL'
        );

        foreach ($cantidades as $idProducto => $cantidad) {
            $producto = $productos[$idProducto];

            if ($producto['stock'] === null) {
                continue; // producto sin inventario: no se mueve
            }

            $stmtDescontar->execute([':cantidad' => $cantidad, ':idProducto' => $idProducto]);

            $movimientos[] = [
                'titulo' => $producto['titulo'],
                'antes' => (int) $producto['stock'],
                'despues' => (int) $producto['stock'] - $cantidad,
            ];
        }

        // Se congela el costo de cada línea al facturar, para que el reporte de
        // ganancias no dependa del costo que tenga el producto más adelante.
        $lineas = json_decode((string) $pedido['productos'], true) ?: [];
        foreach ($lineas as &$linea) {
            $idProducto = isset($linea['idProducto']) ? (int) $linea['idProducto'] : 0;
            if (isset($productos[$idProducto])) {
                $linea['costoUnitario'] = $productos[$idProducto]['costo'];
            }
        }
        unset($linea);

        $stmtUpdate = $conexion->prepare(
            'UPDATE pedidos
                SET estado = :estado, productos = :productos, facturadoPor = :facturadoPor, facturadoAt = NOW()
              WHERE idPedido = :idPedido'
        );
        $stmtUpdate->execute([
            ':estado' => $nuevoEstado,
            ':productos' => json_encode($lineas, JSON_UNESCAPED_UNICODE),
            ':facturadoPor' => $_SESSION['usuario_id'],
            ':idPedido' => $idPedido,
        ]);
    } elseif ($revertir) {
        $stmtDevolver = $conexion->prepare(
            'UPDATE productos SET stock = stock + :cantidad WHERE idProducto = :idProducto AND stock IS NOT NULL'
        );

        foreach ($cantidades as $idProducto => $cantidad) {
            $producto = $productos[$idProducto] ?? null;

            if ($producto === null || $producto['stock'] === null) {
                continue;
            }

            $stmtDevolver->execute([':cantidad' => $cantidad, ':idProducto' => $idProducto]);

            $movimientos[] = [
                'titulo' => $producto['titulo'],
                'antes' => (int) $producto['stock'],
                'despues' => (int) $producto['stock'] + $cantidad,
            ];
        }

        // Deja de estar facturado: se limpia la marca para que no quede en los
        // reportes como una venta cerrada.
        $stmtUpdate = $conexion->prepare(
            'UPDATE pedidos SET estado = :estado, facturadoPor = NULL, facturadoAt = NULL WHERE idPedido = :idPedido'
        );
        $stmtUpdate->execute([':estado' => $nuevoEstado, ':idPedido' => $idPedido]);
    } else {
        $stmtUpdate = $conexion->prepare('UPDATE pedidos SET estado = :estado WHERE idPedido = :idPedido');
        $stmtUpdate->execute([':estado' => $nuevoEstado, ':idPedido' => $idPedido]);
    }

    $conexion->commit();

    if ($facturar) {
        $mensaje = $movimientos === []
            ? 'Pedido facturado (ningún producto tenía stock cargado)'
            : 'Pedido facturado y stock descontado';
    } elseif ($revertir) {
        $mensaje = $movimientos === []
            ? "Pedido marcado como $nuevoEstado"
            : "Pedido marcado como $nuevoEstado y stock devuelto al inventario";
    } else {
        $mensaje = "Pedido marcado como $nuevoEstado";
    }

    respondJson([
        'mensaje' => $mensaje,
        'estado' => $nuevoEstado,
        'stockActualizado' => $facturar || $revertir,
        'movimientos' => $movimientos,
    ]);
} catch (PDOException $error) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }

    $detalle = esLocal() || env('DEBUG') === 'true' ? ': ' . $error->getMessage() : '';
    respondJson(['error' => 'No se pudo actualizar el pedido' . $detalle], 500);
}
