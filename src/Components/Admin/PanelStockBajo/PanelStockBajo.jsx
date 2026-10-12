import React, { useEffect, useState } from 'react';
import { Link as Anchor } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import './PanelStockBajo.css';

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
                <h3>Mínimos y máximos</h3>
                <p>Productos que llegaron a su stock mínimo.</p>
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
