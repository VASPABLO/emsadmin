<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idPedido = isset($_GET['idPedido']) ? $_GET['idPedido'] : null;

        if (!$idPedido) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de pedido para eliminarlo."]);
            exit;
        }

        // Eliminar el pedido de la base de datos
        $sqlDelete = "DELETE FROM pedidos WHERE idPedido = :idPedido";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            echo json_encode(["mensaje" => "Pedido eliminado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar el pedido"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
