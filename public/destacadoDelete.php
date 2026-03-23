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

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idDestacado = isset($_GET['idDestacado']) ? (int) $_GET['idDestacado'] : 0;

        if (!$idDestacado) {
            echo json_encode(["error" => "Se requiere idDestacado"]);
            exit;
        }

        $sqlSelectImagen = "SELECT imagen FROM destacados WHERE idDestacado = :idDestacado";
        $stmtSelectImagen = $conexion->prepare($sqlSelectImagen);
        $stmtSelectImagen->bindParam(':idDestacado', $idDestacado, PDO::PARAM_INT);
        $stmtSelectImagen->execute();
        $imagen = $stmtSelectImagen->fetchColumn();

        $sqlDelete = "DELETE FROM destacados WHERE idDestacado = :idDestacado";
        $stmt = $conexion->prepare($sqlDelete);
        $stmt->bindParam(':idDestacado', $idDestacado, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $carpetaImagenes = './imagenes_destacados/';
            if ($imagen && file_exists($carpetaImagenes . basename($imagen))) {
                unlink($carpetaImagenes . basename($imagen));
            }
            echo json_encode(["mensaje" => "Destacado eliminado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar destacado"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
