// Lógica de la plantilla de carga masiva, sin React: armar el Excel y leer las
// filas de vuelta. Está separada del componente para poder ejercitarla desde
// Node con el mismo código que corre en el navegador.
//
// Se usa CommonJS a propósito: webpack lo importa igual con `import` y Node lo
// puede cargar directo con `require` en las pruebas.

const XLSX = require('xlsx');

const MAX_FILAS = 500;
const MAX_IMAGENES_POR_TANDA = 20; // límite típico de max_file_uploads en PHP

// Columnas de la plantilla, en orden. La clave es la que viaja al backend.
const COLUMNAS = [
    { clave: 'titulo', ancho: 34, ayuda: 'Obligatorio. Nombre del producto.' },
    { clave: 'descripcion', ancho: 40, ayuda: 'Opcional. Texto que se ve en el catálogo.' },
    { clave: 'categoria', ancho: 24, ayuda: 'Obligatorio. Por nombre. Si no existe, se crea sola.' },
    { clave: 'precio', ancho: 12, ayuda: 'Opcional. Solo números, sin símbolo de moneda.' },
    { clave: 'precioAnterior', ancho: 14, ayuda: 'Opcional. Para mostrar el precio tachado.' },
    { clave: 'precioMinimo', ancho: 14, ayuda: 'Opcional. Mínimo que puede cobrar el vendedor.' },
    { clave: 'precioMaximo', ancho: 14, ayuda: 'Opcional. Máximo que puede cobrar el vendedor.' },
    { clave: 'costo', ancho: 12, ayuda: 'Opcional. Costo de compra.' },
    { clave: 'stock', ancho: 10, ayuda: 'Opcional. Cantidad en mano.' },
    { clave: 'stockMinimo', ancho: 12, ayuda: 'Opcional. Para la alerta de stock bajo.' },
    { clave: 'stockMaximo', ancho: 12, ayuda: 'Opcional.' },
    { clave: 'masVendido', ancho: 12, ayuda: 'Opcional. si / no. Vacío = no.' },
    { clave: 'imagen1', ancho: 22, ayuda: 'Opcional. Nombre del archivo, ej: sello50.jpg' },
    { clave: 'imagen2', ancho: 22, ayuda: 'Opcional. Nombre del archivo.' },
    { clave: 'imagen3', ancho: 22, ayuda: 'Opcional. Nombre del archivo.' },
    { clave: 'imagen4', ancho: 22, ayuda: 'Opcional. Nombre del archivo.' },
];

const CAMPOS_IMAGEN = ['imagen1', 'imagen2', 'imagen3', 'imagen4'];

// Para comparar encabezados y nombres de archivo sin pelearse con acentos,
// mayúsculas ni espacios de más.
function normalizar(texto) {
    return String(texto === null || texto === undefined ? '' : texto)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toLowerCase();
}

function soloLetras(texto) {
    return normalizar(texto).replace(/[^a-z0-9]/g, '');
}

// Encabezado del Excel -> clave interna. Acepta variantes con acentos y
// espacios ("Precio mínimo" -> precioMinimo) por si el cliente retoca los
// títulos de las columnas.
const CLAVE_POR_ENCABEZADO = COLUMNAS.reduce(
    (mapa, columna) => {
        mapa[soloLetras(columna.clave)] = columna.clave;
        return mapa;
    },
    {
        nombre: 'titulo',
        producto: 'titulo',
        descripciondelproducto: 'descripcion',
        preciodeventa: 'precio',
    }
);

/** Arma el libro de Excel de la plantilla (4 hojas). */
function construirLibroPlantilla(categorias) {
    const libro = XLSX.utils.book_new();
    const anchos = COLUMNAS.map((c) => ({ wch: c.ancho }));
    const encabezados = COLUMNAS.map((c) => c.clave);

    // Hoja 1: la que se completa. Solo encabezados, para que no queden filas de
    // ejemplo cargándose a la base sin querer.
    const hojaProductos = XLSX.utils.aoa_to_sheet([encabezados]);
    hojaProductos['!cols'] = anchos;
    XLSX.utils.book_append_sheet(libro, hojaProductos, 'Productos');

    // Hoja 2: ejemplo lleno, para copiar y pegar.
    const hojaEjemplo = XLSX.utils.aoa_to_sheet([
        encabezados,
        ['Sello hidráulico tipo U 50x65x10', 'Sello compuesto compacto para émbolos.', 'Sellos Hidráulicos', 12500, 15000, 11000, 14000, 8000, 10, 2, 40, 'no', 'sello50.jpg', '', '', ''],
        ['Cinta de seguridad industrial vial', 'Roja y amarilla, rollo de 100 m.', 'Cintas', 4500, '', '', '', 2800, 25, 5, 60, 'si', 'cinta-vial.jpg', 'cinta-vial-2.jpg', '', ''],
    ]);
    hojaEjemplo['!cols'] = anchos;
    XLSX.utils.book_append_sheet(libro, hojaEjemplo, 'Ejemplo');

    // Hoja 3: categorías que ya existen, para escribirlas igual.
    const hojaCategorias = XLSX.utils.aoa_to_sheet([
        ['idCategoria', 'categoria'],
        ...categorias.map((c) => [c.idCategoria, c.categoria]),
    ]);
    hojaCategorias['!cols'] = [{ wch: 12 }, { wch: 34 }];
    XLSX.utils.book_append_sheet(libro, hojaCategorias, 'Categorias');

    // Hoja 4: instrucciones.
    const hojaAyuda = XLSX.utils.aoa_to_sheet([
        ['Cómo completar la plantilla'],
        [''],
        ['1. Cargá los productos en la hoja "Productos", una fila por producto (máximo ' + MAX_FILAS + ').'],
        ['2. No cambies ni borres la fila de encabezados.'],
        ['3. Para las imágenes escribí solo el NOMBRE del archivo (sello50.jpg).'],
        ['   Al subir la plantilla en el panel vas a poder seleccionar esas imágenes y el'],
        ['   sistema las empareja por nombre. No pegues las fotos dentro del Excel:'],
        ['   las imágenes incrustadas no se pueden leer.'],
        ['4. Se pueden subir hasta ' + MAX_IMAGENES_POR_TANDA + ' imágenes por tanda (límite del servidor).'],
        ['5. La categoría va por nombre. Si no existe, se crea automáticamente.'],
        ['6. Si ya hay un producto con el mismo título, esa fila se omite y el reporte lo avisa.'],
        [''],
        ['Columna', 'Para qué sirve'],
        ...COLUMNAS.map((c) => [c.clave, c.ayuda]),
    ]);
    hojaAyuda['!cols'] = [{ wch: 18 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(libro, hojaAyuda, 'Instrucciones');

    return libro;
}

/**
 * Lee la hoja de productos de un libro ya parseado y devuelve las filas listas
 * para enviar al backend, más los problemas detectados.
 *
 * Devuelve { error } si la hoja no sirve (sin encabezados obligatorios, vacía...).
 */
function leerFilasDelLibro(libro) {
    const hoja = libro.Sheets['Productos'] || libro.Sheets[libro.SheetNames[0]];

    if (!hoja) {
        return { error: 'El archivo no tiene ninguna hoja para leer' };
    }

    // header: 1 => matriz, así se conserva el número de fila real del Excel.
    const matriz = XLSX.utils.sheet_to_json(hoja, { header: 1, blankrows: false, defval: '' });

    if (matriz.length < 2) {
        return { error: 'La hoja no tiene filas de productos debajo del encabezado' };
    }

    const encabezados = matriz[0].map((titulo) => CLAVE_POR_ENCABEZADO[soloLetras(titulo)] || null);

    if (!encabezados.includes('titulo') || !encabezados.includes('categoria')) {
        return { error: 'Faltan las columnas obligatorias "titulo" y "categoria"' };
    }

    const filas = [];
    const errores = [];
    const titulosVistos = new Map();

    matriz.slice(1).forEach((valores, indice) => {
        const numeroFila = indice + 2; // +1 por el encabezado, +1 porque Excel cuenta desde 1
        const fila = { fila: numeroFila };

        encabezados.forEach((clave, columna) => {
            if (clave) {
                fila[clave] = valores[columna] === undefined ? '' : valores[columna];
            }
        });

        const titulo = String(fila.titulo || '').trim();
        const categoria = String(fila.categoria || '').trim();

        // Fila completamente vacía: se ignora sin avisar.
        const tieneAlgo = COLUMNAS.some((c) => String(fila[c.clave] === undefined ? '' : fila[c.clave]).trim() !== '');
        if (!tieneAlgo) {
            return;
        }

        if (!titulo) {
            errores.push({ fila: numeroFila, mensaje: 'Falta el título' });
            return;
        }

        if (!categoria) {
            errores.push({ fila: numeroFila, titulo, mensaje: 'Falta la categoría' });
            return;
        }

        const clave = normalizar(titulo);
        if (titulosVistos.has(clave)) {
            errores.push({
                fila: numeroFila,
                titulo,
                mensaje: 'Título repetido dentro de la planilla (ya está en la fila ' + titulosVistos.get(clave) + ')',
            });
            return;
        }
        titulosVistos.set(clave, numeroFila);

        filas.push(fila);
    });

    if (filas.length > MAX_FILAS) {
        return { error: 'La plantilla trae ' + filas.length + ' productos; el máximo por carga es ' + MAX_FILAS };
    }

    return { filas, errores };
}

/** Nombres de imagen (normalizados) que piden las filas. */
function imagenesPedidasPor(filas) {
    const pedidas = new Set();

    filas.forEach((fila) => {
        CAMPOS_IMAGEN.forEach((campo) => {
            const nombre = String(fila[campo] || '').trim();
            if (nombre) {
                pedidas.add(normalizar(nombre));
            }
        });
    });

    return pedidas;
}

module.exports = {
    COLUMNAS,
    CAMPOS_IMAGEN,
    MAX_FILAS,
    MAX_IMAGENES_POR_TANDA,
    normalizar,
    soloLetras,
    construirLibroPlantilla,
    leerFilasDelLibro,
    imagenesPedidasPor,
};
