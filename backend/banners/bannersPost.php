<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

$rutaweb = rtrim($_ENV['RUTA_WEB'] ?? '', '/');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Verificar si se envió la imagen
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            // Carpeta física (siempre en backend/imagenes_banners)
            $carpetaImagenes = __DIR__ . '/../imagenes_banners';
            if (!file_exists($carpetaImagenes)) {
                mkdir($carpetaImagenes, 0777, true);
            }

            // Subir la imagen
            $nombreImagen = $_FILES['imagen']['name'];
            move_uploaded_file($_FILES['imagen']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen);
            $rutaImagenCompleta = $rutaweb . '/imagenes_banners/' . $nombreImagen;

            // Almacenar enlace completo en la base de datos
            $sqlInsert = "INSERT INTO `banner` (imagen) VALUES (:imagen)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':imagen', $rutaImagenCompleta);
            $stmt->execute();

            // Obtener el ID de la última inserción
            $lastId = $conexion->lastInsertId();

            // Obtener la fecha de creación actualizada
            $sqlSelect = "SELECT createdAt FROM `banner` WHERE idBanner = :lastId";
            $stmtSelect = $conexion->prepare($sqlSelect);
            $stmtSelect->bindParam(':lastId', $lastId);
            $stmtSelect->execute();
            $createdAt = $stmtSelect->fetchColumn();

            // Respuesta JSON con enlace de la imagen y fecha de creación
            echo json_encode([
                "mensaje" => "Banner creado exitosamente",
                "imagen" => $rutaImagenCompleta,
                "createdAt" => $createdAt
            ]);
        } else {
            echo json_encode(["error" => "Debe enviarse una imagen"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
