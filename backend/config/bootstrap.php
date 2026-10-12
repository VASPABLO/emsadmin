<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

$allowedOrigins = [
    'https://emscrsoluciones.com',
    'https://www.emscrsoluciones.com',
    'http://localhost:3000',
    'http://localhost:3001',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

function respondJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
}

function requireRole(array $rolesPermitidos): void
{
    if (empty($_SESSION['usuario_id']) || !in_array($_SESSION['rol'] ?? '', $rolesPermitidos, true)) {
        respondJson(['error' => 'No autorizado'], 401);
    }
}

try {
    require __DIR__ . '/database.php';
} catch (PDOException $error) {
    respondJson(['error' => 'Error de conexión: ' . $error->getMessage()], 500);
}
