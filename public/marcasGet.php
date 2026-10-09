<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

function obtenerColumnaIdMarca(PDO $conexion) {
    $stmt = $conexion->query("SHOW COLUMNS FROM marcas");
    $columnas = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (in_array('idMarca', $columnas, true)) {
        return 'idMarca';
    }

    if (in_array('id', $columnas, true)) {
        return 'id';
    }

    return null;
}

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $idColumna = obtenerColumnaIdMarca($conexion);

        if ($idColumna === null) {
            echo json_encode(["error" => "La tabla marcas no tiene una columna de ID válida"]);
            exit;
        }

        $sqlSelect = "SELECT {$idColumna} AS idMarca, imagen FROM marcas ORDER BY {$idColumna} DESC";
        $stmt = $conexion->query($sqlSelect);
        $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["marcas" => $marcas]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error en la conexión: " . $error->getMessage()]);
}
?>
