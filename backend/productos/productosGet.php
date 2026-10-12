<?php
require __DIR__ . '/../config/bootstrap.php';

try {
    // Verificar el método de la solicitud
    $metodo = $_SERVER['REQUEST_METHOD'];

    // Consulta SQL para obtener todos los productos
    if ($metodo == 'GET') {
        $sqlSelect = "SELECT * FROM productos";
        $sentencia = $conexion->prepare($sqlSelect);

        if ($sentencia->execute()) {
            // Obtener resultados
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);

            // El costo, los umbrales de inventario y el rango de precio negociable son
            // información interna: costo solo para admin; stock/mínimo/máximo para
            // vendedor/cajera/admin; precioMinimo/precioMaximo solo para vendedor/admin
            // (nunca al público, ni siquiera a cajera).
            $rolSesion = $_SESSION['rol'] ?? null;
            $puedeVerInventario = in_array($rolSesion, ['vendedor', 'cajera', 'admin'], true);
            $puedeVerCosto = $rolSesion === 'admin';
            $puedeVerRangoPrecio = in_array($rolSesion, ['vendedor', 'admin'], true);

            foreach ($resultado as &$producto) {
                if (!$puedeVerInventario) {
                    unset($producto['stock'], $producto['stockMinimo'], $producto['stockMaximo']);
                }
                if (!$puedeVerCosto) {
                    unset($producto['costo']);
                }
                if (!$puedeVerRangoPrecio) {
                    unset($producto['precioMinimo'], $producto['precioMaximo']);
                }
            }
            unset($producto);

            // Imprimir datos en formato JSON
            echo json_encode(["productos" => $resultado]);
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
