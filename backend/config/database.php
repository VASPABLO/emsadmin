<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$dsn = "mysql:host=$servidor;dbname=" . $_ENV['DB_NAME'] . ";charset=utf8mb4";

$conexion = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], [
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
]);
$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
