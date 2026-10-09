<?php
require __DIR__ . '/../config/bootstrap.php';

try {
    // Verificar la sesión del usuario
    if (!isset($_SESSION['usuario_id'])) {
        echo json_encode(["error" => "Usuario no autenticado"]);
        exit();
    }

    // Obtener el ID del usuario desde la sesión
    $usuarioId = $_SESSION['usuario_id'];

    // Consulta SQL para obtener datos del usuario sin la imagen
    $sqlSelectUsuario = "SELECT idUsuario, nombre, email, rol FROM `usuarios` WHERE idUsuario = :idUsuario";
    $stmtUsuario = $conexion->prepare($sqlSelectUsuario);
    $stmtUsuario->bindParam(':idUsuario', $usuarioId);

    if ($stmtUsuario->execute()) {
        // Verificar si hay resultados
        if ($stmtUsuario->rowCount() > 0) {
            // Obtener resultados
            $resultadoUsuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

            // Imprimir datos del usuario en formato JSON
            echo json_encode($resultadoUsuario);
        } else {
            echo json_encode(["error" => "Usuario no encontrado"]);
        }
    } else {
        // Imprimir mensaje de error si la ejecución de la consulta falla
        echo json_encode(["error" => "Error al ejecutar la consulta SQL: " . implode(", ", $stmtUsuario->errorInfo())]);
    }
} catch (PDOException $error) {
    // Manejar errores específicos de la conexión
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
} catch (Exception $error) {
    // Manejar otros tipos de errores
    echo json_encode(["error" => "Error desconocido: " . $error->getMessage()]);
} finally {
    // Cerrar la conexión a la base de datos
    $conexion = null;
}
