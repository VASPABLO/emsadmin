<?php

require_once __DIR__ . '/env.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

$origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');

// En producción solo se aceptan los dominios declarados (corsOrigins()).
// En local se acepta además cualquier puerto de localhost/127.0.0.1 y cualquier
// host .test, para que el servidor de desarrollo de React (puerto 3000, 3001, etc.)
// o un vhost de Laragon funcionen sin tocar esta lista.
$permitido = $origin !== '' && in_array($origin, corsOrigins(), true);

if (!$permitido && $origin !== '' && esLocal()) {
    $permitido = preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $origin) === 1
        || preg_match('#^https?://[a-z0-9.\-]+\.(test|local|localhost)(:\d+)?$#i', $origin) === 1;
}

if ($permitido) {
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
    // En producción no se filtra el detalle del error de conexión,
    // salvo que se ponga DEBUG=true en el .env para diagnosticar.
    $detalle = (esLocal() || env('DEBUG') === 'true') ? ': ' . $error->getMessage() : '';
    respondJson(['error' => 'Error de conexión' . $detalle], 500);
}
