<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        respondJson(["error" => "Método no permitido"], 405);
    }

    // categoria y costo se usan en el Excel de reposición (PanelStockBajo).
    $sql = "SELECT p.idProducto, p.titulo, p.stock, p.stockMinimo, p.stockMaximo, p.costo,
                   c.categoria
            FROM productos p
            LEFT JOIN categorias c ON c.idCategoria = p.idCategoria
            WHERE p.stockMinimo IS NOT NULL AND p.stock IS NOT NULL AND p.stock <= p.stockMinimo
            ORDER BY (p.stock - p.stockMinimo) ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    respondJson(["productos" => $productos]);
} catch (PDOException $error) {
    respondJson(["error" => "Error de conexión: " . $error->getMessage()], 500);
}
