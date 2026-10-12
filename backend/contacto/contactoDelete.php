<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idContacto = isset($_GET['idContacto']) ? $_GET['idContacto'] : null;

        if (!$idContacto) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de contacto para eliminarlo."]);
            exit;
        }

        // Eliminar el contacto de la base de datos
        $sqlDelete = "DELETE FROM contacto WHERE idContacto = :idContacto";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idContacto', $idContacto, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            echo json_encode(["mensaje" => "Contacto eliminado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar el contacto"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
