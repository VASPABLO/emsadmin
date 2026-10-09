<?php
require __DIR__ . '/../config/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta para obtener todas las categorías
        $sqlSelect = "SELECT idCategoria, categoria FROM `categorias`";
        $stmt = $conexion->query($sqlSelect);
        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Respuesta JSON con las categorías
        echo json_encode(["categorias" => $categorias]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
