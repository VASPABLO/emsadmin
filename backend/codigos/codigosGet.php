<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta para obtener todos los códigos con descuento
        $sqlSelect = "SELECT idCodigo, codigo, descuento FROM `codigos`";
        $stmt = $conexion->query($sqlSelect);
        $codigos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Respuesta JSON con los códigos y descuentos
        echo json_encode(["codigos" => $codigos]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
