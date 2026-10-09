<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

$rutaweb = isset($_ENV['RUTA_WEB']) ? trim($_ENV['RUTA_WEB']) : '';
if ($rutaweb === '') {
    $https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $scheme = $https ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $rutaweb = $scheme . '://' . $host;
}
$rutaweb = rtrim($rutaweb, '/');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            // Carpeta física (siempre en backend/imagenes_destacados)
            $carpetaImagenes = __DIR__ . '/../imagenes_destacados';
            if (!file_exists($carpetaImagenes)) {
                mkdir($carpetaImagenes, 0777, true);
            }

            $nombreImagen = $_FILES['imagen']['name'];
            move_uploaded_file($_FILES['imagen']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen);
            $rutaImagenCompleta = $rutaweb . '/imagenes_destacados/' . $nombreImagen;

            $sqlInsert = "INSERT INTO destacados (imagen) VALUES (:imagen)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':imagen', $rutaImagenCompleta);
            $stmt->execute();

            echo json_encode(["mensaje" => "Imagen destacada agregada correctamente", "imagen" => $rutaImagenCompleta]);
        } else {
            echo json_encode(["error" => "Debe seleccionar una imagen"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
