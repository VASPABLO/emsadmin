<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    // Verificar el método de la solicitud
    $metodo = $_SERVER['REQUEST_METHOD'];

    // Consulta SQL para obtener todos los usuarios
    if ($metodo == 'GET') {
        $sqlSelect = "SELECT idUsuario, nombre, email, rol, createdAt FROM usuarios";
        $sentencia = $conexion->prepare($sqlSelect);

        if ($sentencia->execute()) {
            // Obtener resultados
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);

            // Imprimir datos en formato JSON
            echo json_encode(["usuarios" => $resultado]);
        } else {
            // Imprimir mensaje de error si la ejecución de la consulta falla
            echo json_encode(["error" => "Error al ejecutar la consulta SQL: " . implode(", ", $sentencia->errorInfo())]);
        }
    } elseif ($metodo == 'DELETE') {
        // Verificar si se proporcionó un ID para eliminar
        $idUsuario = isset($_GET['idUsuario']) ? $_GET['idUsuario'] : null;

        if (!$idUsuario) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de usuario para eliminarlo."]);
            exit;
        }

        // Consulta SQL para eliminar al usuario por ID
        $sqlDelete = "DELETE FROM usuarios WHERE idUsuario = :idUsuario";
        $sentencia = $conexion->prepare($sqlDelete);
        $sentencia->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);

        if ($sentencia->execute()) {
            echo json_encode(["mensaje" => "Usuario eliminado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar al usuario: " . implode(", ", $sentencia->errorInfo())]);
        }
    } elseif ($metodo == 'PUT') {
        // Verificar si se proporcionó un ID y datos para actualizar
        $idUsuario = isset($_GET['idUsuario']) ? $_GET['idUsuario'] : null;
        $datos = json_decode(file_get_contents("php://input"), true);

        if (!$idUsuario || !$datos) {
            echo json_encode(["error" => "Se requiere proporcionar un ID y datos para actualizar al usuario."]);
            exit;
        }

        // Consulta SQL para actualizar el rol del usuario por ID
        $sqlUpdate = "UPDATE usuarios SET rol = :rol WHERE idUsuario = :idUsuario";
        $sentencia = $conexion->prepare($sqlUpdate);
        $sentencia->bindParam(':rol', $datos['rol']);
        $sentencia->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);

        if ($sentencia->execute()) {
            echo json_encode(["mensaje" => "Rol de usuario actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar el rol del usuario: " . implode(", ", $sentencia->errorInfo())]);
        }
    }
} catch (PDOException $error) {
    // Manejar errores específicos de la conexión
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
} catch (Exception $error) {
    // Manejar otros tipos de errores
    echo json_encode(["error" => "Error desconocido: " . $error->getMessage()]);
}
