<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idCategoria = isset($_GET['idCategoria']) ? $_GET['idCategoria'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevaCategoria = isset($data['categoria']) ? $data['categoria'] : null;

        if (!$idCategoria || !$nuevaCategoria) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de categoría y un nuevo nombre de categoría para actualizarla."]);
            exit;
        }

        // Actualizar la categoría en la base de datos
        $sqlUpdate = "UPDATE categorias SET categoria = :categoria WHERE idCategoria = :idCategoria";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':categoria', $nuevaCategoria);
        $sentenciaUpdate->bindParam(':idCategoria', $idCategoria, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Categoría actualizada correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar la categoría: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
