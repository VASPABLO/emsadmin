<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

$rutaweb = rtrim($_ENV['RUTA_WEB'] ?? '', '/');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $descripcion = $_POST['descripcion'];
        $titulo = $_POST['titulo'];
        $precio = isset($_POST['precio']) && $_POST['precio'] !== '' ? $_POST['precio'] : null;
        $precioMinimo = isset($_POST['precioMinimo']) && $_POST['precioMinimo'] !== '' ? $_POST['precioMinimo'] : null;
        $precioMaximo = isset($_POST['precioMaximo']) && $_POST['precioMaximo'] !== '' ? $_POST['precioMaximo'] : null;
        $costo = isset($_POST['costo']) && $_POST['costo'] !== '' ? $_POST['costo'] : null;
        $stock = isset($_POST['stock']) && $_POST['stock'] !== '' ? $_POST['stock'] : null;
        $stockMinimo = isset($_POST['stockMinimo']) && $_POST['stockMinimo'] !== '' ? $_POST['stockMinimo'] : null;
        $stockMaximo = isset($_POST['stockMaximo']) && $_POST['stockMaximo'] !== '' ? $_POST['stockMaximo'] : null;
        $idCategoria = $_POST['idCategoria'];
        $masVendido = 'no';
        $item1 = $_POST['item1'] ?? null;
        $item2 = $_POST['item2'] ?? null;
        $item3 = $_POST['item3'] ?? null;
        $item4 = $_POST['item4'] ?? null;
        $item5 = $_POST['item5'] ?? null;
        $item6 = $_POST['item6'] ?? null;
        $item7 = $_POST['item7'] ?? null;
        $item8 = $_POST['item8'] ?? null;
        $item9 = $_POST['item9'] ?? null;
        $item10 = $_POST['item10'] ?? null;
        if (!empty($titulo) && !empty($idCategoria)) {

            // Verificar si se enviaron imágenes
            $imagenesPresentes = isset($_FILES['imagen1']) || isset($_FILES['imagen2']) || isset($_FILES['imagen3']) || isset($_FILES['imagen4']);

            if ($imagenesPresentes) {

                // Carpeta física (siempre en backend/imagenes_productos, sin importar desde qué subcarpeta corre este script)
                $carpetaImagenes = __DIR__ . '/../imagenes_productos';
                if (!file_exists($carpetaImagenes)) {
                    mkdir($carpetaImagenes, 0777, true);
                }

                // Inicializar rutas de imágenes
                $rutaImagenCompleta = '';
                $rutaImagen2Completa = '';
                $rutaImagen3Completa = '';
                $rutaImagen4Completa = '';

                // Subir imágenes si están presentes
                if (isset($_FILES['imagen1']) && $_FILES['imagen1']['error'] === UPLOAD_ERR_OK) {
                    $nombreImagen = $_FILES['imagen1']['name'];
                    move_uploaded_file($_FILES['imagen1']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen);
                    $rutaImagenCompleta = $rutaweb . '/imagenes_productos/' . $nombreImagen;
                }

                if (isset($_FILES['imagen2']) && $_FILES['imagen2']['error'] === UPLOAD_ERR_OK) {
                    $nombreImagen2 = $_FILES['imagen2']['name'];
                    move_uploaded_file($_FILES['imagen2']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen2);
                    $rutaImagen2Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen2;
                }

                if (isset($_FILES['imagen3']) && $_FILES['imagen3']['error'] === UPLOAD_ERR_OK) {
                    $nombreImagen3 = $_FILES['imagen3']['name'];
                    move_uploaded_file($_FILES['imagen3']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen3);
                    $rutaImagen3Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen3;
                }

                if (isset($_FILES['imagen4']) && $_FILES['imagen4']['error'] === UPLOAD_ERR_OK) {
                    $nombreImagen4 = $_FILES['imagen4']['name'];
                    move_uploaded_file($_FILES['imagen4']['tmp_name'], $carpetaImagenes . '/' . $nombreImagen4);
                    $rutaImagen4Completa = $rutaweb . '/imagenes_productos/' . $nombreImagen4;
                }

                // Verificar que al menos una imagen esté presente
                if ($rutaImagenCompleta === '' && $rutaImagen2Completa === '' && $rutaImagen3Completa === '' && $rutaImagen4Completa === '') {
                    echo json_encode(["error" => "Debe seleccionar al menos una imagen"]);
                    exit;
                }

                // Almacenar enlaces completos en la base de datos
                $sqlInsert = "INSERT INTO `productos` (descripcion, titulo, precio, precioMinimo, precioMaximo, costo, stock, stockMinimo, stockMaximo, idCategoria, masVendido, imagen1, imagen2 , imagen3, imagen4,
                 item1, item2, item3, item4, item5, item6, item7, item8, item9, item10)
                 VALUES (:descripcion, :titulo, :precio, :precioMinimo, :precioMaximo, :costo, :stock, :stockMinimo, :stockMaximo, :idCategoria, :masVendido, :imagen1, :imagen2, :imagen3 , :imagen4,
                 :item1, :item2, :item3, :item4, :item5, :item6, :item7, :item8, :item9, :item10)";
                $stmt = $conexion->prepare($sqlInsert);
                $stmt->bindParam(':descripcion', $descripcion);
                $stmt->bindParam(':titulo', $titulo);
                $stmt->bindParam(':precio', $precio);
                $stmt->bindParam(':precioMinimo', $precioMinimo);
                $stmt->bindParam(':precioMaximo', $precioMaximo);
                $stmt->bindParam(':costo', $costo);
                $stmt->bindParam(':stock', $stock);
                $stmt->bindParam(':stockMinimo', $stockMinimo);
                $stmt->bindParam(':stockMaximo', $stockMaximo);
                $stmt->bindParam(':idCategoria', $idCategoria);
                $stmt->bindParam(':masVendido', $masVendido);
                $stmt->bindParam(':imagen1', $rutaImagenCompleta);
                $stmt->bindParam(':imagen2', $rutaImagen2Completa);
                $stmt->bindParam(':imagen3', $rutaImagen3Completa);
                $stmt->bindParam(':imagen4', $rutaImagen4Completa);
                $stmt->bindParam(':item1', $item1);
                $stmt->bindParam(':item2', $item2);
                $stmt->bindParam(':item3', $item3);
                $stmt->bindParam(':item4', $item4);
                $stmt->bindParam(':item5', $item5);
                $stmt->bindParam(':item6', $item6);
                $stmt->bindParam(':item7', $item7);
                $stmt->bindParam(':item8', $item8);
                $stmt->bindParam(':item9', $item9);
                $stmt->bindParam(':item10', $item10);
                $stmt->execute();

                // Obtener el ID de la última inserción
                $lastId = $conexion->lastInsertId();

                // Obtener la fecha de creación actualizada
                $sqlSelect = "SELECT createdAt FROM `productos` WHERE idProducto = :lastId";
                $stmtSelect = $conexion->prepare($sqlSelect);
                $stmtSelect->bindParam(':lastId', $lastId);
                $stmtSelect->execute();
                $createdAt = $stmtSelect->fetchColumn();

                // Respuesta JSON con enlaces de las imágenes y fecha de creación
                echo json_encode([
                    "mensaje" => "producto creado exitosamente",
                    "imagen1" => $rutaImagenCompleta,
                    "imagen2" => $rutaImagen2Completa,
                    "imagen3" => $rutaImagen3Completa,
                    "imagen4" => $rutaImagen4Completa,
                    "createdAt" => $createdAt
                ]);
            } else {
                echo json_encode(["error" => "Debe seleccionar al menos una imagen"]);
            }
        } else {
            echo json_encode(["error" => "Por favor, complete todos los campos correctamente"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
