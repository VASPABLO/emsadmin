<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
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
