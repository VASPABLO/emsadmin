import React, { useEffect, useState } from 'react';
import { Link as Anchor } from 'react-router-dom';
import './ProductosMain.css';
import baseURL from '../../url';

export default function ProductosMain() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDashboardProducts();
    }, []);

    const cargarDashboardProducts = async () => {
        setLoading(true);

        try {
            const [productosRes, categoriasRes] = await Promise.all([
                fetch(`${baseURL}/productosGet.php`),
                fetch(`${baseURL}/categoriasGet.php`),
            ]);

            const [productosData, categoriasData] = await Promise.all([
                productosRes.json(),
                categoriasRes.json(),
            ]);

            setCategorias(categoriasData.categorias || []);
            setProductos([...(productosData.productos || [])].reverse().slice(0, 5));
        } catch (error) {
            console.error('Error al cargar productos del dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoriaById = (idCategoria) => {
        const categoria = categorias.find((item) => String(item.idCategoria) === String(idCategoria));
        return categoria?.categoria || 'Sin categoría';
    };

    return (
        <div className='dashboardProducts'>
            <div className='dashboardProducts__header'>
                <h3>Ultimos {productos?.length} productos</h3>
                <Anchor to='/dashboard/productos' className='dashboardCardLink'>
                    Ver más
                </Anchor>
            </div>

            <div className='dashboardTableWrap'>
                <table className='dashboardTable'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Titulo</th>
                            <th>Descripcion</th>
                            <th>Categoria</th>
                            <th>Imagen</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan='5' className='dashboardTable__state'>Cargando productos...</td>
                            </tr>
                        ) : productos.length === 0 ? (
                            <tr>
                                <td colSpan='5' className='dashboardTable__state'>No hay productos recientes.</td>
                            </tr>
                        ) : productos.map((item) => (
                            <tr key={item.idProducto}>
                                <td>{item.idProducto}</td>
                                <td>{item.titulo}</td>
                                <td className='truncateCell'>{item.descripcion || '-'}</td>
                                <td>
                                    <span className='categoryBadge'>{getCategoriaById(item.idCategoria)}</span>
                                </td>
                                <td>
                                    {item.imagen1 ? (
                                        <img className='productThumb' src={item.imagen1} alt={item.titulo || 'Producto'} />
                                    ) : (
                                        <span className='imgNonetd'>Sin imagen</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
