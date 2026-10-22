<?php

require_once __DIR__ . '/env.php';

$faltantes = [];
foreach (['DB_HOST', 'DB_NAME', 'DB_USER'] as $clave) {
    if (env($clave) === null) {
        $faltantes[] = $clave;
    }
}

if ($faltantes !== []) {
    $mensaje = 'Faltan variables de entorno (' . implode(', ', $faltantes) . '). '
        . 'Revisá backend/.env.local en desarrollo o backend/.env en producción.';

    if (function_exists('respondJson')) {
        respondJson(['error' => $mensaje], 500);
    }

    throw new RuntimeException($mensaje);
}

$servidor = env('DB_HOST') . ':' . env('DB_PORT', '3306');
$dsn = "mysql:host=$servidor;dbname=" . env('DB_NAME') . ";charset=utf8mb4";

$conexion = new PDO($dsn, env('DB_USER'), env('DB_PASS', ''), [
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
]);
$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
