<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        respondJson(["error" => "Método no permitido"], 405);
    }

    $sql = "SELECT idProducto, titulo, stock, stockMinimo, stockMaximo
            FROM productos
            WHERE stockMinimo IS NOT NULL AND stock IS NOT NULL AND stock <= stockMinimo
            ORDER BY (stock - stockMinimo) ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    respondJson(["productos" => $productos]);
} catch (PDOException $error) {
    respondJson(["error" => "Error de conexión: " . $error->getMessage()], 500);
}
