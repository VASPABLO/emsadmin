<?php
require __DIR__ . '/../config/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // La tabla real usa `id`/`created_at` (no idMarca/createdAt como las demás
        // tablas); se alias a idMarca para no tener que tocar el frontend.
        $sqlSelect = "SELECT id AS idMarca, imagen FROM `marcas` ORDER BY id DESC";
        $stmt = $conexion->query($sqlSelect);
        $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["marcas" => $marcas]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
