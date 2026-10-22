<?php
require __DIR__ . '/../config/bootstrap.php';
require __DIR__ . '/../config/mailer.php';
require __DIR__ . '/recuperacion.php';

// Paso 1 de "olvidé mi contraseña": recibe el email y, si existe un usuario con
// ese correo, le envía un enlace para elegir una contraseña nueva.
//
// La respuesta es siempre la misma exista o no el correo, para no revelar qué
// emails están registrados.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondJson(['error' => 'Método no permitido'], 405);
}

$email = trim((string) ($_POST['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respondJson(['error' => 'Ingresá un correo válido'], 422);
}

$respuestaGenerica = [
    'mensaje' => 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña. Revisá tu bandeja de entrada y la carpeta de spam.',
];

try {
    asegurarTablaRecuperacion($conexion);

    $stmt = $conexion->prepare('SELECT idUsuario, nombre, email FROM `usuarios` WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        respondJson($respuestaGenerica);
    }

    // Evita que se use para llenarle la bandeja a alguien: un correo cada 2 minutos.
    $stmt = $conexion->prepare('SELECT COUNT(*) FROM `recuperar_contrasena`
        WHERE idUsuario = :id AND createdAt > (NOW() - INTERVAL 2 MINUTE)');
    $stmt->execute([':id' => $usuario['idUsuario']]);
    if ((int) $stmt->fetchColumn() > 0) {
        respondJson($respuestaGenerica);
    }

    // Solo queda vigente el último enlace pedido.
    $conexion->prepare('DELETE FROM `recuperar_contrasena` WHERE idUsuario = :id')
        ->execute([':id' => $usuario['idUsuario']]);

    $token = bin2hex(random_bytes(32));

    $conexion->prepare('INSERT INTO `recuperar_contrasena` (idUsuario, tokenHash, expiraEn)
        VALUES (:id, :hash, NOW() + INTERVAL ' . RECUPERACION_MINUTOS_VALIDEZ . ' MINUTE)')
        ->execute([':id' => $usuario['idUsuario'], ':hash' => hashToken($token)]);

    $enlace = frontendUrl() . '/restablecer?token=' . $token;
    $nombre = htmlspecialchars($usuario['nombre'], ENT_QUOTES, 'UTF-8');
    $minutos = RECUPERACION_MINUTOS_VALIDEZ;

    $html = <<<HTML
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1d2939">
    <h2 style="color:#0c71cf">Restablecer contraseña</h2>
    <p>Hola {$nombre},</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón para elegir una nueva:</p>
    <p style="text-align:center;margin:28px 0">
        <a href="{$enlace}" style="background:#0c71cf;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Elegir nueva contraseña</a>
    </p>
    <p style="font-size:13px;color:#667085">El enlace vence en {$minutos} minutos y solo se puede usar una vez. Si no pediste este cambio, ignorá este correo: tu contraseña sigue siendo la misma.</p>
    <p style="font-size:12px;color:#98a2b3;word-break:break-all">Si el botón no funciona, copiá este enlace en el navegador:<br>{$enlace}</p>
</div>
HTML;

    $texto = "Hola {$usuario['nombre']},\n\nPara elegir una nueva contraseña abrí este enlace (vence en {$minutos} minutos):\n{$enlace}\n\nSi no pediste este cambio, ignorá este correo.";

    if (!enviarCorreo($usuario['email'], 'Restablecer tu contraseña', $html, $texto)) {
        // Si el correo no salió se borra el token, para que el límite de 2 minutos no bloquee el reintento.
        $conexion->prepare('DELETE FROM `recuperar_contrasena` WHERE idUsuario = :id')
            ->execute([':id' => $usuario['idUsuario']]);

        // Con DEBUG=true en el .env se muestra el motivo real (usuario/clave de Gmail, puerto bloqueado, etc.).
        $detalle = (esLocal() || env('DEBUG') === 'true') ? ': ' . ($GLOBALS['ultimoErrorCorreo'] ?? '') : '';
        respondJson(['error' => 'No se pudo enviar el correo' . $detalle], 500);
    }

    respondJson($respuestaGenerica);
} catch (PDOException $error) {
    error_log('recuperarPost: ' . $error->getMessage());
    $detalle = (esLocal() || env('DEBUG') === 'true') ? ': ' . $error->getMessage() : '';
    respondJson(['error' => 'Ocurrió un error' . $detalle], 500);
}
