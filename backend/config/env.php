<?php

// Carga de variables de entorno y detección del entorno actual (local / producción).
//
// Orden de archivos: primero .env y después .env.local (si existe, solo en la
// máquina de desarrollo). El último archivo es el que manda, así que .env.local
// sobreescribe a .env sin necesidad de tocarlo. Las variables que ya vengan
// definidas en el entorno del servidor tienen prioridad sobre los dos archivos.
// Esto permite tener el mismo código en desarrollo y en producción: cada entorno
// lee su propio archivo y ninguno de los dos se versiona en git.

if (defined('EMS_ENV_CARGADO')) {
    return;
}
define('EMS_ENV_CARGADO', true);

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..', ['.env', '.env.local'], false);
$dotenv->safeLoad();

/**
 * Lee una variable de entorno. Devuelve $porDefecto si no está definida o está vacía.
 */
function env(string $clave, ?string $porDefecto = null): ?string
{
    $valor = $_ENV[$clave] ?? getenv($clave);

    if ($valor === false || $valor === null || $valor === '') {
        return $porDefecto;
    }

    return trim((string) $valor);
}

/**
 * Entorno actual: 'local' o 'production'.
 * Se puede forzar con APP_ENV en el .env; si no está, se detecta por el host.
 */
function appEnv(): string
{
    $declarado = env('APP_ENV');
    if ($declarado !== null) {
        return strtolower($declarado) === 'local' ? 'local' : 'production';
    }

    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $host = explode(':', $host)[0];

    if ($host === '' ) {
        // Ejecución por consola (scripts de mantenimiento): se asume producción
        // salvo que se declare APP_ENV=local.
        return 'production';
    }

    $esLocal = $host === 'localhost'
        || $host === '127.0.0.1'
        || $host === '::1'
        || str_ends_with($host, '.test')
        || str_ends_with($host, '.local')
        || str_ends_with($host, '.localhost');

    return $esLocal ? 'local' : 'production';
}

function esLocal(): bool
{
    return appEnv() === 'local';
}

/**
 * URL pública desde la que se sirve este backend, sin barra final.
 * Se usa para armar las rutas absolutas de las imágenes que se suben.
 *
 * Si RUTA_WEB está definida en el .env se respeta tal cual; si no, se deduce
 * del propio request (esquema + host + carpeta del backend), de manera que en
 * local salga http://localhost/emsadmin/backend y en producción el dominio.
 */
function rutaWeb(): string
{
    $declarada = env('RUTA_WEB');
    if ($declarada !== null) {
        return rtrim($declarada, '/');
    }

    $esHttps = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
        || (int) ($_SERVER['SERVER_PORT'] ?? 80) === 443;

    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    // Los endpoints viven una carpeta abajo del backend (productos/, auth/, etc.),
    // así que la raíz del backend es el directorio padre del script actual.
    // dirname() usa el separador del sistema (en Windows devuelve el separador
    // invertido), así que se normaliza a '/' antes de armar la URL.
    $script = (string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php');
    $base = rtrim(str_replace(DIRECTORY_SEPARATOR, '/', dirname(dirname($script))), '/');
    if ($base === '.') {
        $base = '';
    }

    return ($esHttps ? 'https' : 'http') . '://' . $host . $base;
}

/**
 * Orígenes permitidos para CORS: los dominios de producción más lo que se
 * agregue en CORS_ORIGINS (separados por coma) en el .env de cada entorno.
 */
function corsOrigins(): array
{
    $origenes = [
        'https://emscrsoluciones.com',
        'https://www.emscrsoluciones.com',
    ];

    $extra = env('CORS_ORIGINS');
    if ($extra !== null) {
        foreach (explode(',', $extra) as $origen) {
            $origen = trim($origen);
            if ($origen !== '') {
                $origenes[] = rtrim($origen, '/');
            }
        }
    }

    return array_values(array_unique($origenes));
}
