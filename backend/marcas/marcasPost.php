<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

$rutaweb = rtrim($_ENV['RUTA_WEB'] ?? '', '/');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Verificar si se envió la imagen
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            // Carpeta física (siempre en backend/imagenes_marcas)
            $carpetaImagenes = __DIR__ . '/../imagenes_marcas';
            if (!file_exists($carpetaImagenes)) {
                mkdir($carpetaImagenes, 0777, true);
            }

            // Subir la imagen
            $nombreImagen = $_FILES['imagen']['name'];
            move_uploaded_file($_FILES['imagen']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen);
            $rutaImagenCompleta = $rutaweb . '/imagenes_marcas/' . $nombreImagen;

            // Almacenar enlace completo en la base de datos
            $sqlInsert = "INSERT INTO `marcas` (imagen) VALUES (:imagen)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':imagen', $rutaImagenCompleta);
            $stmt->execute();

            echo json_encode([
                "mensaje" => "Marca creada correctamente",
                "imagen" => $rutaImagenCompleta,
            ]);
        } else {
            echo json_encode(["error" => "No se recibió imagen o hubo un error en la carga"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
