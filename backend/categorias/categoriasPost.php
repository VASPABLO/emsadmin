<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $categoria = $_POST['categoria'];

        if (!empty($categoria)) {
            // Verificar si la categoría ya existe
            $sqlCheck = "SELECT idCategoria FROM `categorias` WHERE categoria = :categoria";
            $stmtCheck = $conexion->prepare($sqlCheck);
            $stmtCheck->bindParam(':categoria', $categoria);
            $stmtCheck->execute();

            if ($stmtCheck->rowCount() > 0) {
                echo json_encode(["error" => "La categoría ya existe"]);
            } else {
                // Almacenar en la base de datos
                $sqlInsert = "INSERT INTO `categorias` (categoria) VALUES (:categoria)";
                $stmt = $conexion->prepare($sqlInsert);
                $stmt->bindParam(':categoria', $categoria);
                $stmt->execute();

                // Obtener el ID de la última inserción
                $lastId = $conexion->lastInsertId();

                // Respuesta JSON con ID de la categoría creada
                echo json_encode([
                    "mensaje" => "Categoría creada exitosamente",
                    "idCategoria" => $lastId
                ]);
            }
        } else {
            echo json_encode(["error" => "Por favor, proporcione el nombre de la categoría"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
