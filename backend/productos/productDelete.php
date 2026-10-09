<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idProducto = isset($_GET['idProducto']) ? $_GET['idProducto'] : null;

        if (!$idProducto) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de producto para eliminarlo."]);
            exit;
        }

        // Obtener nombres de archivo de la base de datos
        $sqlSelectImagenes = "SELECT imagen1, imagen2, imagen3, imagen4 FROM productos WHERE idProducto = :idProducto";
        $sentenciaSelectImagenes = $conexion->prepare($sqlSelectImagenes);
        $sentenciaSelectImagenes->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $sentenciaSelectImagenes->execute();
        $imagenes = $sentenciaSelectImagenes->fetch(PDO::FETCH_ASSOC);

        // Eliminar el producto de la base de datos
        $sqlDelete = "DELETE FROM productos WHERE idProducto = :idProducto";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            // Eliminar archivos de la carpeta imagenes_productos
            $carpetaImagenes = './imagenes_productos/';
            foreach ($imagenes as $imagen) {
                if ($imagen) {
                    $rutaImagen = $carpetaImagenes . basename($imagen);
                    if (file_exists($rutaImagen)) {
                        unlink($rutaImagen);
                    }
                }
            }

            echo json_encode(["mensaje" => "Producto y archivos asociados eliminados correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar el producto"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
