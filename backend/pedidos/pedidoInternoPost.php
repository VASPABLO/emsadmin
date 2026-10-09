<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['vendedor', 'admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondJson(["error" => "Método no permitido"], 405);
}

try {
    $data = json_decode(file_get_contents("php://input"), true);

    $nombre = isset($data['nombre']) ? trim((string) $data['nombre']) : '';
    $email = isset($data['email']) ? trim((string) $data['email']) : '';
    $telefono = isset($data['telefono']) ? trim((string) $data['telefono']) : '';
    $entrega = isset($data['entrega']) ? trim((string) $data['entrega']) : '';
    $nota = isset($data['nota']) ? trim((string) $data['nota']) : null;
    $pago = isset($data['pago']) ? trim((string) $data['pago']) : '';
    $lineasSolicitadas = isset($data['productos']) && is_array($data['productos']) ? $data['productos'] : [];

    if ($nota === '') {
        $nota = null;
    }

    $camposObligatorios = [
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'entrega' => $entrega,
        'pago' => $pago,
    ];

    $faltantes = [];
    foreach ($camposObligatorios as $campo => $valor) {
        if ($valor === null || trim($valor) === '') {
            $faltantes[] = $campo;
        }
    }

    if (!empty($faltantes)) {
        respondJson([
            "error" => "Por favor, complete todos los campos obligatorios",
            "faltantes" => $faltantes,
        ], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respondJson(["error" => "El email no es válido"], 422);
    }

    if (count($lineasSolicitadas) === 0) {
        respondJson(["error" => "El pedido debe tener al menos un producto"], 422);
    }

    // No confiamos en el precio que mande el cliente: lo buscamos en la base por idProducto.
    // Si el producto tiene precioMinimo/precioMaximo, el vendedor puede pedir un precio
    // de venta dentro de ese rango (para negociar); si no, se usa siempre el precio de lista.
    $sqlProducto = "SELECT idProducto, titulo, precio, precioMinimo, precioMaximo, imagen1, stock FROM productos WHERE idProducto = :idProducto";
    $stmtProducto = $conexion->prepare($sqlProducto);

    $lineasPedido = [];
    $total = 0;

    foreach ($lineasSolicitadas as $linea) {
        $idProducto = isset($linea['idProducto']) ? (int) $linea['idProducto'] : 0;
        $cantidad = isset($linea['cantidad']) ? (int) $linea['cantidad'] : 0;
        $precioSolicitado = isset($linea['precioVenta']) && $linea['precioVenta'] !== ''
            ? (float) $linea['precioVenta']
            : null;

        if ($idProducto <= 0 || $cantidad <= 0) {
            continue;
        }

        $stmtProducto->execute([':idProducto' => $idProducto]);
        $producto = $stmtProducto->fetch(PDO::FETCH_ASSOC);

        if (!$producto) {
            respondJson(["error" => "El producto {$idProducto} no existe"], 422);
        }

        $precio = (float) ($producto['precio'] ?? 0);
        $precioMinimo = $producto['precioMinimo'] !== null ? (float) $producto['precioMinimo'] : null;
        $precioMaximo = $producto['precioMaximo'] !== null ? (float) $producto['precioMaximo'] : null;

        if ($precioSolicitado !== null && $precioMinimo !== null && $precioMaximo !== null) {
            if ($precioSolicitado < $precioMinimo || $precioSolicitado > $precioMaximo) {
                respondJson([
                    "error" => "El precio de \"{$producto['titulo']}\" debe estar entre {$precioMinimo} y {$precioMaximo}",
                ], 422);
            }
            $precio = $precioSolicitado;
        }

        $subtotal = round($precio * $cantidad, 2);
        $total += $subtotal;

        $lineasPedido[] = [
            "idProducto" => $producto['idProducto'],
            "titulo" => $producto['titulo'],
            "cantidad" => $cantidad,
            "precio" => $precio,
            "subtotal" => $subtotal,
            "imagen" => $producto['imagen1'],
        ];
    }

    if (count($lineasPedido) === 0) {
        respondJson(["error" => "El pedido debe tener al menos un producto válido"], 422);
    }

    $sqlInsertPedido = "INSERT INTO `pedidos` (
        estado, productos, total, nombre, email, telefono, entrega, nota, pago, origen, creadoPor
    ) VALUES (
        :estado, :productos, :total, :nombre, :email, :telefono, :entrega, :nota, :pago, 'interno', :creadoPor
    )";

    $stmtPedido = $conexion->prepare($sqlInsertPedido);
    $stmtPedido->execute([
        ':estado' => 'Pendiente',
        ':productos' => json_encode($lineasPedido, JSON_UNESCAPED_UNICODE),
        ':total' => number_format($total, 2, '.', ''),
        ':nombre' => $nombre,
        ':email' => $email,
        ':telefono' => $telefono,
        ':entrega' => $entrega,
        ':nota' => $nota,
        ':pago' => $pago === '' ? 'pendiente' : $pago,
        ':creadoPor' => $_SESSION['usuario_id'],
    ]);

    $lastPedidoId = $conexion->lastInsertId();

    respondJson([
        "mensaje" => "Pedido N°{$lastPedidoId} enviado a caja",
        "idPedido" => (int) $lastPedidoId,
    ], 200);
} catch (PDOException $error) {
    respondJson([
        "error" => "Error al procesar el pedido",
        "detalle" => $error->getMessage(),
    ], 500);
} catch (Throwable $error) {
    respondJson([
        "error" => "Error inesperado",
        "detalle" => $error->getMessage(),
    ], 500);
}
