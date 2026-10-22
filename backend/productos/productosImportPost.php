<?php
// Carga masiva de productos desde la plantilla de Excel.
//
// El Excel lo parsea el frontend con SheetJS (ya estaba instalado) y acá llegan
// las filas ya normalizadas en JSON, más las imágenes que el usuario seleccionó
// aparte. Las filas se emparejan con las imágenes por nombre de archivo.
//
// Entrada (multipart/form-data):
//   filas      -> JSON: [{ fila, titulo, descripcion, categoria, precio, ... , imagen1..4 }]
//   imagenes[] -> archivos de imagen (opcional)
//
// Salida: resumen + el detalle de qué pasó con cada fila.

require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

const MAX_FILAS = 500;
const MAX_BYTES_IMAGEN = 5 * 1024 * 1024;
const EXTENSIONES_VALIDAS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondJson(['error' => 'Método no permitido'], 405);
}

// Si el POST supera post_max_size, PHP entrega $_POST y $_FILES vacíos sin avisar.
if (empty($_POST) && empty($_FILES) && ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    $limite = ini_get('post_max_size');
    respondJson([
        'error' => "El envío superó el límite del servidor ($limite). Subí menos imágenes por vez o achicalas.",
    ], 413);
}

$filas = json_decode($_POST['filas'] ?? '', true);

if (!is_array($filas) || $filas === []) {
    respondJson(['error' => 'No se recibió ninguna fila para importar'], 400);
}

if (count($filas) > MAX_FILAS) {
    respondJson(['error' => 'La plantilla trae ' . count($filas) . ' filas; el máximo por carga es ' . MAX_FILAS], 400);
}

/**
 * Deja el nombre de archivo en algo seguro de guardar (sin rutas ni acentos).
 */
function nombreSeguro(string $nombre): string
{
    $nombre = basename(str_replace('\\', '/', $nombre));
    $extension = strtolower(pathinfo($nombre, PATHINFO_EXTENSION));
    $base = pathinfo($nombre, PATHINFO_FILENAME);

    $base = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $base) ?: $base;
    $base = preg_replace('/[^A-Za-z0-9._-]+/', '-', $base);
    $base = trim((string) $base, '-.');

    if ($base === '') {
        $base = 'imagen';
    }

    return $extension !== '' ? $base . '.' . $extension : $base;
}

/** Normaliza para comparar: sin acentos, sin espacios de más, en minúscula. */
function clave(string $texto): string
{
    $texto = trim($texto);
    $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto) ?: $texto;

    return strtolower(preg_replace('/\s+/', ' ', $texto) ?? $texto);
}

/** Entero o null; acepta "12.500", "12,500", "₡12 500" y números reales. */
function aEntero($valor): ?int
{
    if ($valor === null || $valor === '' || $valor === false) {
        return null;
    }

    if (is_int($valor) || is_float($valor)) {
        return (int) round((float) $valor);
    }

    $texto = preg_replace('/[^0-9.,\-]/', '', (string) $valor);
    if ($texto === '' || $texto === '-') {
        return null;
    }

    $ultimaComa = strrpos($texto, ',');
    $ultimoPunto = strrpos($texto, '.');
    $separador = max($ultimaComa === false ? -1 : $ultimaComa, $ultimoPunto === false ? -1 : $ultimoPunto);

    if ($separador > -1) {
        $decimales = strlen($texto) - $separador - 1;
        // 3 dígitos después del separador = separador de miles (12.500), no decimales.
        if ($decimales === 3) {
            $texto = str_replace([',', '.'], '', $texto);
        } else {
            $entero = str_replace([',', '.'], '', substr($texto, 0, $separador));
            $texto = $entero . '.' . substr($texto, $separador + 1);
        }
    }

    return is_numeric($texto) ? (int) round((float) $texto) : null;
}

// ---------------------------------------------------------------- imágenes
// Se indexan por nombre de archivo para emparejarlas con lo que diga cada fila.
$imagenesSubidas = [];
$avisosImagenes = [];

if (!empty($_FILES['imagenes']) && is_array($_FILES['imagenes']['name'])) {
    foreach ($_FILES['imagenes']['name'] as $i => $nombreOriginal) {
        $error = $_FILES['imagenes']['error'][$i];

        if ($error !== UPLOAD_ERR_OK) {
            $avisosImagenes[] = "No se pudo recibir «$nombreOriginal» (código $error)";
            continue;
        }

        if ($_FILES['imagenes']['size'][$i] > MAX_BYTES_IMAGEN) {
            $avisosImagenes[] = "«$nombreOriginal» pesa más de 5 MB y se omitió";
            continue;
        }

        $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if (!in_array($extension, EXTENSIONES_VALIDAS, true) || @getimagesize($_FILES['imagenes']['tmp_name'][$i]) === false) {
            $avisosImagenes[] = "«$nombreOriginal» no es una imagen válida y se omitió";
            continue;
        }

        $imagenesSubidas[clave($nombreOriginal)] = [
            'tmp' => $_FILES['imagenes']['tmp_name'][$i],
            'nombre' => $nombreOriginal,
            'url' => null, // se llena cuando se mueve a su carpeta definitiva
        ];
    }
}

$carpetaImagenes = __DIR__ . '/../imagenes_productos';
$rutaweb = rutaWeb();

/**
 * Mueve la imagen a imagenes_productos la primera vez que se usa y devuelve su
 * URL. Si dos filas apuntan al mismo archivo, se sube una sola vez.
 */
function urlDeImagen(string $nombreEnLaFila, array &$imagenesSubidas, string $carpeta, string $rutaweb): ?string
{
    $indice = clave($nombreEnLaFila);

    if (!isset($imagenesSubidas[$indice])) {
        return null;
    }

    if ($imagenesSubidas[$indice]['url'] !== null) {
        return $imagenesSubidas[$indice]['url'];
    }

    if (!is_dir($carpeta) && !mkdir($carpeta, 0775, true) && !is_dir($carpeta)) {
        return null;
    }

    $destino = nombreSeguro($imagenesSubidas[$indice]['nombre']);
    $extension = pathinfo($destino, PATHINFO_EXTENSION);
    $base = pathinfo($destino, PATHINFO_FILENAME);
    $intento = 1;

    // No pisar una imagen existente de otro producto.
    while (file_exists($carpeta . '/' . $destino)) {
        $intento++;
        $destino = $base . '-' . $intento . ($extension !== '' ? '.' . $extension : '');
    }

    if (!move_uploaded_file($imagenesSubidas[$indice]['tmp'], $carpeta . '/' . $destino)) {
        return null;
    }

    $imagenesSubidas[$indice]['url'] = $rutaweb . '/imagenes_productos/' . rawurlencode($destino);

    return $imagenesSubidas[$indice]['url'];
}

try {
    // ------------------------------------------------------- datos actuales
    $categoriasPorNombre = [];
    foreach ($conexion->query('SELECT idCategoria, categoria FROM categorias')->fetchAll(PDO::FETCH_ASSOC) as $c) {
        $categoriasPorNombre[clave($c['categoria'])] = (int) $c['idCategoria'];
    }

    $titulosExistentes = [];
    foreach ($conexion->query('SELECT titulo FROM productos')->fetchAll(PDO::FETCH_COLUMN) as $titulo) {
        $titulosExistentes[clave((string) $titulo)] = true;
    }

    $sqlInsert = 'INSERT INTO productos
        (titulo, descripcion, idCategoria, masVendido, precio, precioAnterior, precioMinimo, precioMaximo,
         costo, stock, stockMinimo, stockMaximo, imagen1, imagen2, imagen3, imagen4)
        VALUES
        (:titulo, :descripcion, :idCategoria, :masVendido, :precio, :precioAnterior, :precioMinimo, :precioMaximo,
         :costo, :stock, :stockMinimo, :stockMaximo, :imagen1, :imagen2, :imagen3, :imagen4)';

    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtCategoria = $conexion->prepare('INSERT INTO categorias (categoria) VALUES (:categoria)');

    $detalle = [];
    $creados = 0;
    $omitidos = 0;
    $conError = 0;
    $categoriasCreadas = [];

    $conexion->beginTransaction();

    foreach ($filas as $indice => $fila) {
        $numeroFila = (int) ($fila['fila'] ?? ($indice + 2));
        $titulo = trim((string) ($fila['titulo'] ?? ''));
        $nombreCategoria = trim((string) ($fila['categoria'] ?? ''));

        $anotar = function (string $estado, string $mensaje) use (&$detalle, $numeroFila, $titulo) {
            $detalle[] = ['fila' => $numeroFila, 'titulo' => $titulo, 'estado' => $estado, 'mensaje' => $mensaje];
        };

        if ($titulo === '') {
            $conError++;
            $anotar('error', 'Falta el título');
            continue;
        }

        if (mb_strlen($titulo) > 255) {
            $conError++;
            $anotar('error', 'El título supera los 255 caracteres');
            continue;
        }

        if ($nombreCategoria === '') {
            $conError++;
            $anotar('error', 'Falta la categoría');
            continue;
        }

        // Duplicados contra la base y contra filas anteriores de la misma planilla.
        if (isset($titulosExistentes[clave($titulo)])) {
            $omitidos++;
            $anotar('omitido', 'Ya existe un producto con ese título');
            continue;
        }

        $claveCategoria = clave($nombreCategoria);

        if (!isset($categoriasPorNombre[$claveCategoria])) {
            $stmtCategoria->execute([':categoria' => $nombreCategoria]);
            $categoriasPorNombre[$claveCategoria] = (int) $conexion->lastInsertId();
            $categoriasCreadas[] = $nombreCategoria;
        }

        // Imágenes: lo que no se encuentre entre los archivos subidos se avisa,
        // pero no impide crear el producto.
        $urlsImagenes = [];
        $faltantes = [];

        foreach (['imagen1', 'imagen2', 'imagen3', 'imagen4'] as $campo) {
            $nombreArchivo = trim((string) ($fila[$campo] ?? ''));

            if ($nombreArchivo === '') {
                $urlsImagenes[$campo] = null;
                continue;
            }

            $url = urlDeImagen($nombreArchivo, $imagenesSubidas, $carpetaImagenes, $rutaweb);

            if ($url === null) {
                $faltantes[] = $nombreArchivo;
            }

            $urlsImagenes[$campo] = $url;
        }

        $masVendido = in_array(clave((string) ($fila['masVendido'] ?? '')), ['si', 'sí', 'yes', '1', 'true'], true) ? 'si' : 'no';

        $stmtInsert->execute([
            ':titulo' => $titulo,
            ':descripcion' => trim((string) ($fila['descripcion'] ?? '')),
            ':idCategoria' => $categoriasPorNombre[$claveCategoria],
            ':masVendido' => $masVendido,
            ':precio' => aEntero($fila['precio'] ?? null),
            ':precioAnterior' => aEntero($fila['precioAnterior'] ?? null),
            ':precioMinimo' => aEntero($fila['precioMinimo'] ?? null),
            ':precioMaximo' => aEntero($fila['precioMaximo'] ?? null),
            ':costo' => aEntero($fila['costo'] ?? null),
            ':stock' => aEntero($fila['stock'] ?? null),
            ':stockMinimo' => aEntero($fila['stockMinimo'] ?? null),
            ':stockMaximo' => aEntero($fila['stockMaximo'] ?? null),
            ':imagen1' => $urlsImagenes['imagen1'],
            ':imagen2' => $urlsImagenes['imagen2'],
            ':imagen3' => $urlsImagenes['imagen3'],
            ':imagen4' => $urlsImagenes['imagen4'],
        ]);

        $titulosExistentes[clave($titulo)] = true;
        $creados++;

        $anotar(
            'creado',
            $faltantes === []
                ? 'Producto creado'
                : 'Producto creado, pero no se encontró la imagen: ' . implode(', ', $faltantes)
        );
    }

    $conexion->commit();

    $imagenesSinUsar = [];
    foreach ($imagenesSubidas as $imagen) {
        if ($imagen['url'] === null) {
            $imagenesSinUsar[] = $imagen['nombre'];
        }
    }

    respondJson([
        'mensaje' => "Importación terminada: $creados creados, $omitidos omitidos, $conError con error",
        'resumen' => [
            'creados' => $creados,
            'omitidos' => $omitidos,
            'errores' => $conError,
            'categoriasCreadas' => array_values(array_unique($categoriasCreadas)),
            'imagenesSinUsar' => $imagenesSinUsar,
            'avisosImagenes' => $avisosImagenes,
        ],
        'filas' => $detalle,
    ]);
} catch (PDOException $error) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }

    $detalleError = esLocal() || env('DEBUG') === 'true' ? ': ' . $error->getMessage() : '';
    respondJson(['error' => 'No se pudo importar, no se guardó ningún producto' . $detalleError], 500);
}
