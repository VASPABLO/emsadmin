<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['vendedor', 'admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respondJson(["error" => "Método no permitido"], 405);
}

try {
    $telefono = isset($_GET['telefono']) ? trim((string) $_GET['telefono']) : '';
    $email = isset($_GET['email']) ? trim((string) $_GET['email']) : '';

    if ($telefono === '' && $email === '') {
        respondJson(["cliente" => null]);
    }

    // Busca el pedido más reciente de ese cliente (por teléfono o email) para
    // reutilizar sus datos de contacto. Se prioriza el teléfono por ser el dato
    // que más rápido completa un vendedor en el mostrador.
    if ($telefono !== '') {
        $sql = "SELECT nombre, email, telefono FROM pedidos WHERE telefono = :valor ORDER BY createdAt DESC LIMIT 1";
        $valor = $telefono;
    } else {
        $sql = "SELECT nombre, email, telefono FROM pedidos WHERE email = :valor ORDER BY createdAt DESC LIMIT 1";
        $valor = $email;
    }

    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(':valor', $valor);
    $stmt->execute();

    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    respondJson(["cliente" => $cliente ?: null]);
} catch (PDOException $error) {
    respondJson(["error" => "Error de conexión: " . $error->getMessage()], 500);
}
