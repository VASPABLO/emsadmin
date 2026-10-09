<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['cajera', 'admin']);

try {
    // Verificar el método de la solicitud
    $metodo = $_SERVER['REQUEST_METHOD'];

    // Consulta SQL para obtener los datos de pedidos
    if ($metodo == 'GET') {
        $sqlBase = "SELECT pedidos.*, creador.nombre AS creadoPorNombre, facturador.nombre AS facturadoPorNombre
                     FROM pedidos
                     LEFT JOIN usuarios creador ON creador.idUsuario = pedidos.creadoPor
                     LEFT JOIN usuarios facturador ON facturador.idUsuario = pedidos.facturadoPor";

        // Cajera solo ve los pedidos internos (creados por vendedores); admin ve todos.
        if ($_SESSION['rol'] === 'cajera') {
            $sqlSelect = $sqlBase . " WHERE pedidos.origen = 'interno'";
        } else {
            $sqlSelect = $sqlBase;
        }
        $sentencia = $conexion->prepare($sqlSelect);

        if ($sentencia->execute()) {
            // Obtener resultados
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);
        
            // Imprimir datos en formato JSON
            echo json_encode(["pedidos" => $resultado]);
        } else {
            // Imprimir mensaje de error si la ejecución de la consulta falla
            echo json_encode(["error" => "Error al ejecutar la consulta SQL: " . implode(", ", $sentencia->errorInfo())]);
        }
    }
} catch (PDOException $error) {
    // Manejar errores específicos de la conexión
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
} catch (Exception $error) {
    // Manejar otros tipos de errores
    echo json_encode(["error" => "Error desconocido: " . $error->getMessage()]);
}
