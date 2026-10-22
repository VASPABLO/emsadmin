import React, { useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown, faFileImport, faXmark, faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import {
    MAX_IMAGENES_POR_TANDA,
    normalizar,
    construirLibroPlantilla,
    leerFilasDelLibro,
    imagenesPedidasPor,
} from './plantillaProductos';
import './ImportarProductos.css';

export default function ImportarProductos({ categorias = [], onImported }) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [filas, setFilas] = useState([]);
    const [errores, setErrores] = useState([]);
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [reporte, setReporte] = useState(null);

    const inputExcel = useRef(null);
    const inputImagenes = useRef(null);

    const descargarPlantilla = () => {
        XLSX.writeFile(construirLibroPlantilla(categorias), 'plantilla-productos.xlsx');
        toast.success('Plantilla descargada');
    };

    const leerExcel = async (archivo) => {
        if (!archivo) return;

        try {
            const datos = await archivo.arrayBuffer();
            const resultado = leerFilasDelLibro(XLSX.read(datos, { type: 'array' }));

            if (resultado.error) {
                toast.error(resultado.error);
                return;
            }

            setFilas(resultado.filas);
            setErrores(resultado.errores);
            setNombreArchivo(archivo.name);
            setReporte(null);
        } catch (error) {
            console.error('Error al leer el Excel:', error);
            toast.error('No se pudo leer el archivo. ¿Es un .xlsx válido?');
        }
    };

    const imagenesPedidas = useMemo(() => imagenesPedidasPor(filas), [filas]);

    const imagenesCargadas = useMemo(
        () => new Set(imagenes.map((archivo) => normalizar(archivo.name))),
        [imagenes]
    );

    // Las que alguna fila nombra pero no están entre las seleccionadas.
    const imagenesFaltantes = useMemo(
        () => [...imagenesPedidas].filter((nombre) => !imagenesCargadas.has(nombre)),
        [imagenesPedidas, imagenesCargadas]
    );

    // Las que se van a enviar: solo las que alguna fila usa.
    const imagenesAEnviar = useMemo(
        () => imagenes.filter((archivo) => imagenesPedidas.has(normalizar(archivo.name))),
        [imagenes, imagenesPedidas]
    );

    const excedeTanda = imagenesAEnviar.length > MAX_IMAGENES_POR_TANDA;

    const importar = async () => {
        if (filas.length === 0) {
            toast.error('No hay filas para importar');
            return;
        }

        if (excedeTanda) {
            toast.error(`El servidor acepta hasta ${MAX_IMAGENES_POR_TANDA} imágenes por envío. Importá en tandas más chicas.`);
            return;
        }

        setEnviando(true);

        try {
            const datos = new FormData();
            datos.append('filas', JSON.stringify(filas));
            imagenesAEnviar.forEach((archivo) => datos.append('imagenes[]', archivo, archivo.name));

            const respuesta = await apiFetch(`${baseURL}/productos/productosImportPost.php`, {
                method: 'POST',
                body: datos,
            });

            const resultado = await respuesta.json();

            if (resultado.error) {
                toast.error(resultado.error);
                return;
            }

            setReporte(resultado);
            toast.success(resultado.mensaje);

            if (resultado.resumen?.creados > 0 && typeof onImported === 'function') {
                onImported();
            }
        } catch (error) {
            console.error('Error al importar:', error);
            toast.error('No se pudo conectar con el servidor');
        } finally {
            setEnviando(false);
        }
    };

    const limpiar = () => {
        setFilas([]);
        setErrores([]);
        setImagenes([]);
        setNombreArchivo('');
        setReporte(null);
        if (inputExcel.current) inputExcel.current.value = '';
        if (inputImagenes.current) inputImagenes.current.value = '';
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        limpiar();
    };

    return (
        <>
            <button className='plantilla' type='button' onClick={descargarPlantilla}>
                <FontAwesomeIcon icon={faFileArrowDown} /> Plantilla
            </button>

            <button className='importar' type='button' onClick={() => setModalAbierto(true)}>
                <FontAwesomeIcon icon={faFileImport} /> Importar
            </button>

            {modalAbierto && (
                <div className='adminModalOverlay' onClick={cerrarModal}>
                    <div className='adminModal importarModal' onClick={(evento) => evento.stopPropagation()}>
                        <div className='adminModal__header'>
                            <div>
                                <span className='adminModal__tag'>Carga masiva</span>
                                <h3>Importar productos desde Excel</h3>
                                <p>Subí la plantilla completa y, si usaste nombres de imagen, las fotos.</p>
                            </div>

                            <button className='adminModal__close' type='button' onClick={cerrarModal}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <div className='adminModal__body'>
                            <div className='modernField'>
                                <label htmlFor='archivoExcel'>1. Plantilla (.xlsx)</label>
                                <input
                                    id='archivoExcel'
                                    ref={inputExcel}
                                    type='file'
                                    accept='.xlsx,.xls'
                                    onChange={(evento) => leerExcel(evento.target.files?.[0])}
                                />
                                {nombreArchivo && (
                                    <span className='importarHint'>
                                        {nombreArchivo}: {filas.length} producto{filas.length === 1 ? '' : 's'} listo{filas.length === 1 ? '' : 's'}
                                        {errores.length > 0 && `, ${errores.length} fila${errores.length === 1 ? '' : 's'} con problemas`}
                                    </span>
                                )}
                            </div>

                            <div className='modernField'>
                                <label htmlFor='archivoImagenes'>2. Imágenes (opcional)</label>
                                <input
                                    id='archivoImagenes'
                                    ref={inputImagenes}
                                    type='file'
                                    accept='image/*'
                                    multiple
                                    onChange={(evento) => setImagenes([...(evento.target.files || [])])}
                                />
                                {imagenesPedidas.size > 0 && (
                                    <span className='importarHint'>
                                        La plantilla nombra {imagenesPedidas.size} imagen{imagenesPedidas.size === 1 ? '' : 'es'};
                                        seleccionaste {imagenes.length} y se van a enviar {imagenesAEnviar.length}.
                                    </span>
                                )}
                            </div>

                            {excedeTanda && (
                                <div className='importarAviso'>
                                    <FontAwesomeIcon icon={faTriangleExclamation} />
                                    <div>
                                        <strong>Demasiadas imágenes en un solo envío</strong>
                                        <span>
                                            Son {imagenesAEnviar.length} y el servidor acepta {MAX_IMAGENES_POR_TANDA} por vez.
                                            Dividí la planilla en tandas más chicas.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {imagenesFaltantes.length > 0 && (
                                <div className='importarAviso'>
                                    <FontAwesomeIcon icon={faTriangleExclamation} />
                                    <div>
                                        <strong>Faltan {imagenesFaltantes.length} imagen{imagenesFaltantes.length === 1 ? '' : 'es'}</strong>
                                        <span>{imagenesFaltantes.slice(0, 6).join(', ')}{imagenesFaltantes.length > 6 ? '…' : ''}</span>
                                        <span>Los productos se crean igual, pero sin esa foto.</span>
                                    </div>
                                </div>
                            )}

                            {errores.length > 0 && (
                                <div className='importarLista importarLista--error'>
                                    <strong>Filas que no se van a importar</strong>
                                    <ul>
                                        {errores.slice(0, 10).map((error) => (
                                            <li key={error.fila}>Fila {error.fila}: {error.mensaje}</li>
                                        ))}
                                    </ul>
                                    {errores.length > 10 && <span>y {errores.length - 10} más…</span>}
                                </div>
                            )}

                            {reporte && (
                                <div className='importarLista'>
                                    <strong>
                                        <FontAwesomeIcon icon={faCheck} /> {reporte.resumen.creados} creados ·{' '}
                                        {reporte.resumen.omitidos} omitidos · {reporte.resumen.errores} con error
                                    </strong>

                                    {reporte.resumen.categoriasCreadas?.length > 0 && (
                                        <span>Categorías nuevas: {reporte.resumen.categoriasCreadas.join(', ')}</span>
                                    )}

                                    {reporte.resumen.imagenesSinUsar?.length > 0 && (
                                        <span>Imágenes que no usó ninguna fila: {reporte.resumen.imagenesSinUsar.join(', ')}</span>
                                    )}

                                    {reporte.resumen.avisosImagenes?.map((aviso) => (
                                        <span key={aviso}>{aviso}</span>
                                    ))}

                                    <ul>
                                        {reporte.filas
                                            .filter((fila) => fila.mensaje !== 'Producto creado')
                                            .slice(0, 15)
                                            .map((fila) => (
                                                <li key={`${fila.fila}-${fila.estado}`}>
                                                    Fila {fila.fila}: {fila.mensaje}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className='adminModal__footer'>
                            <button className='modalBtn modalBtn--ghost' type='button' onClick={reporte ? cerrarModal : limpiar}>
                                {reporte ? 'Cerrar' : 'Limpiar'}
                            </button>

                            <button
                                className='modalBtn modalBtn--primary'
                                type='button'
                                onClick={importar}
                                disabled={enviando || filas.length === 0}
                            >
                                {enviando ? 'Importando...' : `Importar ${filas.length} producto${filas.length === 1 ? '' : 's'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
