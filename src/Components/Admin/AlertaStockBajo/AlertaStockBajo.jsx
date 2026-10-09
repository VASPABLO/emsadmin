import React, { useEffect, useState } from 'react';
import { Link as Anchor } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import { useAuth } from '../../../Context/AuthContext';
import './AlertaStockBajo.css';

export default function AlertaStockBajo() {
    const { usuario } = useAuth();
    const [productos, setProductos] = useState([]);
    const [cerrada, setCerrada] = useState(false);

    useEffect(() => {
        if (usuario?.rol !== 'admin') return;

        apiFetch(`${baseURL}/productos/stockBajoGet.php`, { method: 'GET' })
            .then((r) => r.json())
            .then((data) => setProductos(data.productos || []))
            .catch((error) => console.error('Error al cargar stock bajo:', error));
    }, [usuario]);

    if (usuario?.rol !== 'admin' || productos.length === 0 || cerrada) {
        return null;
    }

    return (
        <div className='alertaStockBajo'>
            <FontAwesomeIcon icon={faTriangleExclamation} className='alertaStockBajo__icono' />
            <span className='alertaStockBajo__texto'>
                <strong>{productos.length}</strong> producto{productos.length === 1 ? '' : 's'} están en su
                stock mínimo:{' '}
                {productos.slice(0, 3).map((p) => p.titulo).join(', ')}
                {productos.length > 3 ? `, +${productos.length - 3} más` : ''}
            </span>
            <Anchor to='/dashboard/reportes' className='alertaStockBajo__link'>
                Ver detalle
            </Anchor>
            <button
                type='button'
                className='alertaStockBajo__cerrar'
                onClick={() => setCerrada(true)}
                aria-label='Cerrar alerta'
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    );
}
