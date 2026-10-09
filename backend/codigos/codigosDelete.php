<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idCodigo = isset($_GET['idCodigo']) ? $_GET['idCodigo'] : null;

        if (!$idCodigo) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de código para eliminarlo."]);
            exit;
        }

        // Eliminar el código de la base de datos
        $sqlDelete = "DELETE FROM codigos WHERE idCodigo = :idCodigo";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idCodigo', $idCodigo, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            echo json_encode(["mensaje" => "Código eliminado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar el código"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
