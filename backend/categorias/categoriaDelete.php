<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idCategoria = isset($_GET['idCategoria']) ? $_GET['idCategoria'] : null;

        if (!$idCategoria) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de categoría para eliminarla."]);
            exit;
        }

        // Verificar si hay productos asociados a la categoría
        $sqlCheckProducts = "SELECT COUNT(*) FROM productos WHERE idCategoria = :idCategoria";
        $sentenciaCheckProducts = $conexion->prepare($sqlCheckProducts);
        $sentenciaCheckProducts->bindParam(':idCategoria', $idCategoria, PDO::PARAM_INT);
        $sentenciaCheckProducts->execute();
        $cantidadProductos = $sentenciaCheckProducts->fetchColumn();

        if ($cantidadProductos > 0) {
            echo json_encode(["error" => "No se puede eliminar la categoría porque hay productos asociados a ella."]);
            exit;
        }

        // Eliminar la categoría de la base de datos
        $sqlDelete = "DELETE FROM categorias WHERE idCategoria = :idCategoria";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idCategoria', $idCategoria, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            echo json_encode(["mensaje" => "Categoría eliminada correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar la categoría"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
