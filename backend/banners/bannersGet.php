<?php
require __DIR__ . '/../config/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta para obtener todos los banners con las imágenes
        $sqlSelect = "SELECT idBanner, imagen FROM `banner`";
        $stmt = $conexion->query($sqlSelect);
        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Respuesta JSON con los banners y sus imágenes  
        echo json_encode(["banner" => $banners]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
