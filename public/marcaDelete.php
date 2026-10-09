<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idMarca = isset($_GET['idMarca']) ? (int) $_GET['idMarca'] : 0;
        if (!$idMarca && isset($_GET['id'])) {
            $idMarca = (int) $_GET['id'];
        }

        if (!$idMarca) {
            echo json_encode(["error" => "Se requiere idMarca"]);
            exit;
        }

        $idColumna = obtenerColumnaIdMarca($conexion);
        if ($idColumna === null) {
            echo json_encode(["error" => "La tabla marcas no tiene una columna de ID válida"]);
            exit;
        }

        $sqlSelectImagen = "SELECT imagen FROM marcas WHERE {$idColumna} = :idMarca";
        $stmtSelectImagen = $conexion->prepare($sqlSelectImagen);
        $stmtSelectImagen->bindParam(':idMarca', $idMarca, PDO::PARAM_INT);
        $stmtSelectImagen->execute();
        $imagen = $stmtSelectImagen->fetchColumn();

        $sqlDelete = "DELETE FROM marcas WHERE {$idColumna} = :idMarca";
        $stmt = $conexion->prepare($sqlDelete);
        $stmt->bindParam(':idMarca', $idMarca, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $carpetaImagenes = './imagenes_marcas/';
            if ($imagen && file_exists($carpetaImagenes . basename($imagen))) {
                unlink($carpetaImagenes . basename($imagen));
            }
            echo json_encode(["mensaje" => "Marca eliminada correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar marca"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error en la conexión: " . $error->getMessage()]);
}
?>
