<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
$rutaweb = isset($_ENV['RUTA_WEB']) ? trim($_ENV['RUTA_WEB']) : '';

if ($rutaweb === '') {
    $https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $scheme = $https ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $rutaweb = $scheme . '://' . $host;
}

$rutaweb = rtrim($rutaweb, '/') . '/';

function generarNombreImagen($nombreOriginal) {
    $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
    $extension = preg_replace('/[^a-z0-9]/', '', $extension);
    if ($extension === '') {
        $extension = 'jpg';
    }
    return uniqid('destacado_', true) . '.' . $extension;
}

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $carpetaImagenes = './imagenes_destacados';
            if (!file_exists($carpetaImagenes)) {
                mkdir($carpetaImagenes, 0777, true);
            }

            $nombreImagen = generarNombreImagen($_FILES['imagen']['name']);
            $rutaImagen = $carpetaImagenes . '/' . $nombreImagen;
            if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaImagen)) {
                echo json_encode(["error" => "No se pudo guardar la imagen destacada"]);
                exit;
            }
            $rutaImagenCompleta = $rutaweb . ltrim($rutaImagen, './');

            $sqlInsert = "INSERT INTO destacados (imagen) VALUES (:imagen)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':imagen', $rutaImagenCompleta);
            $stmt->execute();

            echo json_encode(["mensaje" => "Imagen destacada agregada correctamente", "imagen" => $rutaImagenCompleta]);
        } else {
            echo json_encode(["error" => "Debe seleccionar una imagen"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
