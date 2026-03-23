<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function respondJson(array $payload, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    respondJson(['ok' => true], 200);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondJson(["error" => "Método no permitido"], 405);
}

try {
    require __DIR__.'/vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    $dbHost = $_ENV['DB_HOST'] ?? '';
    $dbPort = $_ENV['DB_PORT'] ?? '3306';
    $dbUser = $_ENV['DB_USER'] ?? '';
    $dbPass = $_ENV['DB_PASS'] ?? '';
    $dbName = $_ENV['DB_NAME'] ?? '';

    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    $conexion = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $estado = isset($_POST['estado']) ? trim((string) $_POST['estado']) : 'Pendiente';
    $productosRaw = isset($_POST['productos']) ? trim((string) $_POST['productos']) : '';
    $total = isset($_POST['total']) ? trim((string) $_POST['total']) : '';
    $nombre = isset($_POST['nombre']) ? trim((string) $_POST['nombre']) : '';
    $email = isset($_POST['email']) ? trim((string) $_POST['email']) : '';
    $telefono = isset($_POST['telefono']) ? trim((string) $_POST['telefono']) : '';
    $entrega = isset($_POST['entrega']) ? trim((string) $_POST['entrega']) : '';
    $nota = isset($_POST['nota']) ? trim((string) $_POST['nota']) : null;
    $codigo = isset($_POST['codigo']) ? trim((string) $_POST['codigo']) : null;
    $pago = isset($_POST['pago']) ? trim((string) $_POST['pago']) : '';

    if ($nota === '') {
        $nota = null;
    }
    if ($codigo === '') {
        $codigo = null;
    }

    $camposObligatorios = [
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'entrega' => $entrega,
        'pago' => $pago,
    ];

    $faltantes = [];
    foreach ($camposObligatorios as $campo => $valor) {
        if ($valor === null || trim($valor) === '') {
            $faltantes[] = $campo;
        }
    }

    if (!empty($faltantes)) {
        respondJson([
            "error" => "Por favor, complete todos los campos obligatorios",
            "faltantes" => $faltantes,
        ], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respondJson(["error" => "El email no es válido"], 422);
    }

    if (!is_numeric($total)) {
        respondJson(["error" => "El total no es válido"], 422);
    }

    $productos = json_decode($productosRaw, true);
    if (!is_array($productos) || count($productos) === 0) {
        respondJson(["error" => "Los productos del pedido no son válidos"], 422);
    }

    $totalNormalizado = number_format((float) $total, 2, '.', '');

    $sqlInsertPedido = "INSERT INTO `pedidos` (
        estado,
        productos,
        total,
        nombre,
        email,
        telefono,
        entrega,
        nota,
        codigo,
        pago
    ) VALUES (
        :estado,
        :productos,
        :total,
        :nombre,
        :email,
        :telefono,
        :entrega,
        :nota,
        :codigo,
        :pago
    )";

    $stmtPedido = $conexion->prepare($sqlInsertPedido);
    $stmtPedido->execute([
        ':estado' => $estado,
        ':productos' => $productosRaw,
        ':total' => $totalNormalizado,
        ':nombre' => $nombre,
        ':email' => $email,
        ':telefono' => $telefono,
        ':entrega' => $entrega,
        ':nota' => $nota,
        ':codigo' => $codigo,
        ':pago' => $pago,
    ]);

    $lastPedidoId = $conexion->lastInsertId();

    respondJson([
        "mensaje" => "{$nombre} tu pedido es el N°{$lastPedidoId}",
        "idPedido" => (int) $lastPedidoId,
    ], 200);
} catch (PDOException $error) {
    respondJson([
        "error" => "Error al procesar el pedido",
        "detalle" => $error->getMessage(),
    ], 500);
} catch (Throwable $error) {
    respondJson([
        "error" => "Error inesperado",
        "detalle" => $error->getMessage(),
    ], 500);
}
?>
