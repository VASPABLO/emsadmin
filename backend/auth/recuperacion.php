<?php

// Utilidades compartidas por recuperarPost.php y restablecerPost.php.
//
// El token que viaja en el enlace del correo nunca se guarda tal cual: en la
// base solo queda su hash SHA-256, así que si alguien lee la tabla no puede
// usar los tokens. Cada token vale una sola vez y vence a la hora.

const RECUPERACION_MINUTOS_VALIDEZ = 60;

// Crea la tabla la primera vez que se usa, para no depender de correr un script de setup.
function asegurarTablaRecuperacion(PDO $conexion): void
{
    $conexion->exec("CREATE TABLE IF NOT EXISTS `recuperar_contrasena` (
        idRecuperacion INT(11) AUTO_INCREMENT PRIMARY KEY,
        idUsuario INT(11) NOT NULL,
        tokenHash CHAR(64) NOT NULL,
        expiraEn DATETIME NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_tokenHash (tokenHash),
        KEY idx_idUsuario (idUsuario)
    )");
}

function hashToken(string $token): string
{
    return hash('sha256', $token);
}

/**
 * URL del frontend (donde está la pantalla /restablecer), sin barra final.
 * Se toma de FRONTEND_URL en el .env; nunca del request, para que nadie pueda
 * hacer que el enlace del correo apunte a otro dominio.
 */
function frontendUrl(): string
{
    return rtrim(env('FRONTEND_URL', 'https://emscrsoluciones.com'), '/');
}
