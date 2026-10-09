<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idMarca = isset($_GET['idMarca']) ? (int) $_GET['idMarca'] : 0;

        if (!$idMarca) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de marca para eliminarla."]);
            exit;
        }

        // La tabla real usa la columna `id` (no idMarca como las demás tablas).
        $sqlSelectImagen = "SELECT imagen FROM marcas WHERE id = :idMarca";
        $sentenciaSelectImagen = $conexion->prepare($sqlSelectImagen);
        $sentenciaSelectImagen->bindParam(':idMarca', $idMarca, PDO::PARAM_INT);
        $sentenciaSelectImagen->execute();
        $imagen = $sentenciaSelectImagen->fetchColumn();

        // Eliminar la marca de la base de datos
        $sqlDelete = "DELETE FROM marcas WHERE id = :idMarca";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idMarca', $idMarca, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            // Eliminar archivo de la carpeta imagenes_marcas
            $carpetaImagenes = __DIR__ . '/../imagenes_marcas/';
            if ($imagen && file_exists($carpetaImagenes . basename($imagen))) {
                unlink($carpetaImagenes . basename($imagen));
            }

            echo json_encode(["mensaje" => "Marca y archivo de imagen asociado eliminados correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar la marca"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
