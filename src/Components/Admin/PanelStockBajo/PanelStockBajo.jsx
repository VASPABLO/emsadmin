import React, { useEffect, useState } from 'react';
import { Link as Anchor } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import './PanelStockBajo.css';

// Cuánto pedir para reponer: hasta el máximo si está definido; si no, hasta el mínimo.
const cantidadAPedir = (producto) => {
    const stock = Number(producto.stock);
    const objetivo = producto.stockMaximo !== null ? Number(producto.stockMaximo) : Number(producto.stockMinimo);
    return Math.max(objetivo - stock, 0);
};

const descargarExcel = (productos) => {
    let costoTotal = 0;

    const filas = productos.map((producto) => {
        const cantidad = cantidadAPedir(producto);
        const costo = producto.costo !== null ? Number(producto.costo) : null;
        const costoEstimado = costo !== null ? costo * cantidad : null;
        costoTotal += costoEstimado || 0;

        return {
            'ID': Number(producto.idProducto),
            'Producto': producto.titulo,
            'Categoría': producto.categoria || '',
            'Stock actual': Number(producto.stock),
            'Stock mínimo': Number(producto.stockMinimo),
            'Stock máximo': producto.stockMaximo !== null ? Number(producto.stockMaximo) : '',
            'Cantidad a pedir': cantidad,
            'Costo unitario': costo !== null ? costo : '',
            'Costo estimado': costoEstimado !== null ? costoEstimado : '',
        };
    });

    filas.push({ 'Cantidad a pedir': 'Total:', 'Costo estimado': costoTotal });

    const hoja = XLSX.utils.json_to_sheet(filas);
    hoja['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 18 }, { wch: 12 }, { wch: 13 }, { wch: 13 }, { wch: 16 }, { wch: 14 }, { wch: 15 }];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reposición');

    const hoy = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `stock-minimo-${hoy}.xlsx`);
};

export default function PanelStockBajo() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch(`${baseURL}/productos/stockBajoGet.php`, { method: 'GET' })
            .then((r) => r.json())
            .then((data) => {
                setProductos(data.productos || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al cargar stock bajo:', error);
                setLoading(false);
            });
    }, []);

    return (
        <section className='panelStockBajo'>
            <div className='panelStockBajo__header'>
                <div>
                    <h3>Mínimos y máximos</h3>
                    <p>Productos que llegaron a su stock mínimo.</p>
                </div>
                {productos.length > 0 && (
                    <button
                        type='button'
                        className='panelStockBajo__excel'
                        onClick={() => descargarExcel(productos)}
                    >
                        <FontAwesomeIcon icon={faArrowDown} /> Excel
                    </button>
                )}
            </div>

            {loading ? (
                <p className='panelStockBajo__cargando'>Cargando...</p>
            ) : productos.length === 0 ? (
                <p className='panelStockBajo__vacio'>Ningún producto está en su mínimo por ahora.</p>
            ) : (
                <div className='panelStockBajo__lista'>
                    {productos.map((producto) => (
                        <Anchor
                            key={producto.idProducto}
                            to='/dashboard/productos'
                            className='panelStockBajo__item'
                        >
                            <FontAwesomeIcon icon={faTriangleExclamation} className='panelStockBajo__icono' />
                            <div className='panelStockBajo__itemInfo'>
                                <span className='panelStockBajo__titulo'>{producto.titulo}</span>
                                <span className='panelStockBajo__detalle'>
                                    Stock: {producto.stock} · Mínimo: {producto.stockMinimo}
                                </span>
                            </div>
                        </Anchor>
                    ))}
                </div>
            )}
        </section>
    );
}
