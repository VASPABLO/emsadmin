<?php
require __DIR__ . '/../config/bootstrap.php';
require __DIR__ . '/recuperacion.php';

// Paso 2 de "olvidé mi contraseña": recibe el token del enlace del correo y la
// contraseña nueva. Si el token es válido y no venció, cambia la contraseña y
// borra el token para que no se pueda volver a usar.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondJson(['error' => 'Método no permitido'], 405);
}

$token = trim((string) ($_POST['token'] ?? ''));
$contrasena = (string) ($_POST['contrasena'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    respondJson(['error' => 'El enlace no es válido. Pedí uno nuevo.'], 422);
}

if (mb_strlen($contrasena) < 8) {
    respondJson(['error' => 'La contraseña debe tener al menos 8 caracteres'], 422);
}

try {
    asegurarTablaRecuperacion($conexion);

    $stmt = $conexion->prepare('SELECT idUsuario FROM `recuperar_contrasena`
        WHERE tokenHash = :hash AND expiraEn > NOW() LIMIT 1');
    $stmt->execute([':hash' => hashToken($token)]);
    $idUsuario = $stmt->fetchColumn();

    if (!$idUsuario) {
        respondJson(['error' => 'El enlace venció o ya fue usado. Pedí uno nuevo.'], 422);
    }

    $conexion->beginTransaction();

    $conexion->prepare('UPDATE `usuarios` SET contrasena = :contrasena WHERE idUsuario = :id')
        ->execute([':contrasena' => password_hash($contrasena, PASSWORD_DEFAULT), ':id' => $idUsuario]);

    $conexion->prepare('DELETE FROM `recuperar_contrasena` WHERE idUsuario = :id')
        ->execute([':id' => $idUsuario]);

    $conexion->commit();

    respondJson(['mensaje' => 'Contraseña actualizada. Ya podés iniciar sesión.']);
} catch (PDOException $error) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    error_log('restablecerPost: ' . $error->getMessage());
    respondJson(['error' => 'Ocurrió un error. Intentá de nuevo más tarde.'], 500);
}
