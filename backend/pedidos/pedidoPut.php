<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['cajera', 'admin']);

$ESTADOS_INTERNOS_VALIDOS = ['Pendiente', 'En proceso', 'Recibido', 'Facturado', 'Rechazado'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idPedido = isset($_GET['idPedido']) ? $_GET['idPedido'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevoEstado = isset($data['estado']) ? $data['estado'] : null;

        if (!$idPedido || !$nuevoEstado) {
            echo json_encode(["error" => "ID de pedido o estado no proporcionado"]);
            exit;
        }

        $sqlSelect = "SELECT origen, estado, productos FROM pedidos WHERE idPedido = :idPedido";
        $stmtSelect = $conexion->prepare($sqlSelect);
        $stmtSelect->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);
        $stmtSelect->execute();
        $pedidoActual = $stmtSelect->fetch(PDO::FETCH_ASSOC);

        if (!$pedidoActual) {
            echo json_encode(["error" => "Pedido no encontrado"]);
            exit;
        }

        if ($pedidoActual['origen'] === 'interno' && !in_array($nuevoEstado, $ESTADOS_INTERNOS_VALIDOS, true)) {
            echo json_encode(["error" => "Estado no válido para un pedido interno"]);
            exit;
        }

        $facturarAhora = $nuevoEstado === 'Facturado'
            && $pedidoActual['origen'] === 'interno'
            && $pedidoActual['estado'] !== 'Facturado';

        $conexion->beginTransaction();
        try {
            if ($facturarAhora) {
                // Rebajar inventario y capturar el costo de cada línea al momento de facturar,
                // para que el reporte de ganancias no dependa del costo actual del producto.
                $lineas = json_decode($pedidoActual['productos'], true) ?: [];

                $sqlDescontar = "UPDATE productos SET stock = stock - :cantidad WHERE idProducto = :idProducto";
                $stmtDescontar = $conexion->prepare($sqlDescontar);
                $sqlCosto = "SELECT costo FROM productos WHERE idProducto = :idProducto";
                $stmtCosto = $conexion->prepare($sqlCosto);

                foreach ($lineas as &$linea) {
                    $idProductoLinea = isset($linea['idProducto']) ? (int) $linea['idProducto'] : 0;
                    $cantidadLinea = isset($linea['cantidad']) ? (int) $linea['cantidad'] : 0;

                    if ($idProductoLinea > 0 && $cantidadLinea > 0) {
                        $stmtDescontar->execute([':cantidad' => $cantidadLinea, ':idProducto' => $idProductoLinea]);
                        $stmtCosto->execute([':idProducto' => $idProductoLinea]);
                        $linea['costoUnitario'] = $stmtCosto->fetchColumn();
                    }
                }
                unset($linea);

                $productosActualizados = json_encode($lineas, JSON_UNESCAPED_UNICODE);

                $sqlUpdatePedido = "UPDATE pedidos SET estado = :estado, productos = :productos, facturadoPor = :facturadoPor, facturadoAt = NOW() WHERE idPedido = :idPedido";
                $sentenciaUpdatePedido = $conexion->prepare($sqlUpdatePedido);
                $sentenciaUpdatePedido->bindParam(':estado', $nuevoEstado);
                $sentenciaUpdatePedido->bindParam(':productos', $productosActualizados);
                $sentenciaUpdatePedido->bindParam(':facturadoPor', $_SESSION['usuario_id'], PDO::PARAM_INT);
                $sentenciaUpdatePedido->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);
            } else {
                $sqlUpdatePedido = "UPDATE pedidos SET estado = :estado WHERE idPedido = :idPedido";
                $sentenciaUpdatePedido = $conexion->prepare($sqlUpdatePedido);
                $sentenciaUpdatePedido->bindParam(':estado', $nuevoEstado);
                $sentenciaUpdatePedido->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);
            }

            $sentenciaUpdatePedido->execute();
            $conexion->commit();
            echo json_encode(["mensaje" => "Estado del pedido actualizado correctamente"]);
        } catch (Exception $errorTransaccion) {
            $conexion->rollBack();
            echo json_encode(["error" => "Error al actualizar el estado del pedido: " . $errorTransaccion->getMessage()]);
        }
        exit;
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
