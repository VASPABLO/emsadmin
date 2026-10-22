<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

$rutaweb = rutaWeb();
$carpetaImagenes = __DIR__ . '/../imagenes_productos';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idProducto = isset($_REQUEST['idProducto']) ? $_REQUEST['idProducto'] : null;

        if (!$idProducto) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de producto para actualizar las imágenes."]);
            exit;
        }

        if (!file_exists($carpetaImagenes)) {
            mkdir($carpetaImagenes, 0777, true);
        }

        $nombreImagen1 = $_FILES['imagen1']['name'];
        $rutaImagen1Completa = '';
        if (!empty($nombreImagen1)) {
            if (move_uploaded_file($_FILES['imagen1']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen1)) {
                $rutaImagen1Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen1;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen1"]);
                exit;
            }
        }

        $nombreImagen2 = $_FILES['imagen2']['name'];
        $rutaImagen2Completa = '';
        if (!empty($nombreImagen2)) {
            if (move_uploaded_file($_FILES['imagen2']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen2)) {
                $rutaImagen2Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen2;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen2"]);
                exit;
            }
        }

        $nombreImagen3 = $_FILES['imagen3']['name'];
        $rutaImagen3Completa = '';
        if (!empty($nombreImagen3)) {
            if (move_uploaded_file($_FILES['imagen3']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen3)) {
                $rutaImagen3Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen3;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen3"]);
                exit;
            }
        }

        $nombreImagen4 = $_FILES['imagen4']['name'];
        $rutaImagen4Completa = '';
        if (!empty($nombreImagen4)) {
            if (move_uploaded_file($_FILES['imagen4']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen4)) {
                $rutaImagen4Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen4;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen4"]);
                exit;
            }
        }

        $sqlSelect = "SELECT imagen1, imagen2, imagen3, imagen4 FROM productos WHERE idProducto = :idProducto";
        $sentenciaSelect = $conexion->prepare($sqlSelect);
        $sentenciaSelect->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $sentenciaSelect->execute();
        $valoresActuales = $sentenciaSelect->fetch(PDO::FETCH_ASSOC);

        $rutaImagen1Completa = $rutaImagen1Completa ?: $valoresActuales['imagen1'];
        $rutaImagen2Completa = $rutaImagen2Completa ?: $valoresActuales['imagen2'];
        $rutaImagen3Completa = $rutaImagen3Completa ?: $valoresActuales['imagen3'];
        $rutaImagen4Completa = $rutaImagen4Completa ?: $valoresActuales['imagen4'];

        $sqlUpdate = "UPDATE productos SET imagen1 = :imagen1, imagen2 = :imagen2, imagen3 = :imagen3, imagen4 = :imagen4 WHERE idProducto = :idProducto";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':imagen1', $rutaImagen1Completa);
        $sentenciaUpdate->bindParam(':imagen2', $rutaImagen2Completa);
        $sentenciaUpdate->bindParam(':imagen3', $rutaImagen3Completa);
        $sentenciaUpdate->bindParam(':imagen4', $rutaImagen4Completa);
        $sentenciaUpdate->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Imágenes actualizadas correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar las imágenes: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
