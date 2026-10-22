<?php

// Envío de correos con PHPMailer, configurado con las variables MAIL_* del .env.
//
//   MAIL_MAILER=smtp  -> envía de verdad por SMTP (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD).
//   MAIL_MAILER=log   -> no envía nada: escribe el correo en backend/logs/mail.log
//                        (útil en desarrollo para copiar el enlace sin tener SMTP).
//
// MAIL_SCHEME acepta "smtps"/"ssl" (puerto 465) o "tls" (STARTTLS, puerto 587).
// Si se deja vacío o en null, se deduce del puerto.

require_once __DIR__ . '/env.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailerException;

/**
 * Igual que env(), pero trata el texto "null" (estilo Laravel) como vacío.
 */
function envMail(string $clave, ?string $porDefecto = null): ?string
{
    $valor = env($clave);
    if ($valor === null || strtolower($valor) === 'null') {
        return $porDefecto;
    }
    return $valor;
}

/**
 * Envía un correo HTML. Devuelve true si se envió (o se registró en el log).
 * Los errores se registran con error_log() y no se muestran al usuario.
 */
function enviarCorreo(string $para, string $asunto, string $html, string $texto = ''): bool
{
    $desde = envMail('MAIL_FROM_ADDRESS', 'no-reply@emscrsoluciones.com');
    $nombreDesde = envMail('MAIL_FROM_NAME') ?: envMail('APP_NAME', 'EMS Soluciones');
    $texto = $texto !== '' ? $texto : trim(strip_tags($html));

    if (strtolower(envMail('MAIL_MAILER', 'smtp')) === 'log') {
        $carpeta = __DIR__ . '/../logs';
        if (!is_dir($carpeta)) {
            mkdir($carpeta, 0775, true);
        }
        $entrada = sprintf(
            "[%s] Para: %s\nAsunto: %s\n\n%s\n%s\n",
            date('Y-m-d H:i:s'),
            $para,
            $asunto,
            $texto,
            str_repeat('-', 60)
        );
        return file_put_contents($carpeta . '/mail.log', $entrada, FILE_APPEND) !== false;
    }

    $mail = new PHPMailer(true);

    try {
        $puerto = (int) envMail('MAIL_PORT', '587');
        $esquema = strtolower((string) envMail('MAIL_SCHEME', ''));

        $mail->isSMTP();
        $mail->Host = (string) envMail('MAIL_HOST', '');
        $mail->Port = $puerto;
        $mail->SMTPAuth = envMail('MAIL_USERNAME') !== null;
        $mail->Username = (string) envMail('MAIL_USERNAME', '');
        $mail->Password = (string) envMail('MAIL_PASSWORD', '');

        if (in_array($esquema, ['smtps', 'ssl'], true) || ($esquema === '' && $puerto === 465)) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($esquema === 'tls' || ($esquema === '' && $puerto === 587)) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->setFrom($desde, $nombreDesde);
        $mail->addAddress($para);
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = $html;
        $mail->AltBody = $texto;

        $mail->send();
        return true;
    } catch (MailerException $error) {
        $GLOBALS['ultimoErrorCorreo'] = $mail->ErrorInfo;
        error_log('Error al enviar correo a ' . $para . ': ' . $mail->ErrorInfo);
        return false;
    }
}
