<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idBanner = isset($_GET['idBanner']) ? $_GET['idBanner'] : null;

        if (!$idBanner) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de banner para eliminarlo."]);
            exit;
        }

        // Obtener nombres de archivo de la base de datos
        $sqlSelectImagenes = "SELECT imagen FROM banner WHERE idBanner = :idBanner";
        $sentenciaSelectImagenes = $conexion->prepare($sqlSelectImagenes);
        $sentenciaSelectImagenes->bindParam(':idBanner', $idBanner, PDO::PARAM_INT);
        $sentenciaSelectImagenes->execute();
        $imagen = $sentenciaSelectImagenes->fetchColumn();

        // Eliminar el banner de la base de datos
        $sqlDelete = "DELETE FROM banner WHERE idBanner = :idBanner";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idBanner', $idBanner, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            // Eliminar archivo de la carpeta imagenes_banners
            $carpetaImagenes = './imagenes_banners/';
            if ($imagen && file_exists($carpetaImagenes . basename($imagen))) {
                unlink($carpetaImagenes . basename($imagen));
            }

            echo json_encode(["mensaje" => "Banner y archivo de imagen asociado eliminados correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar el banner"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
