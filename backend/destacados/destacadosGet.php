<?php
require __DIR__ . '/../config/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sqlSelect = "SELECT idDestacado, imagen FROM destacados ORDER BY idDestacado DESC";
        $stmt = $conexion->query($sqlSelect);
        $destacados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["destacados" => $destacados]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
