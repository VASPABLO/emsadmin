import React, { useEffect, useState } from 'react';
import './CardsCantidad.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faImage, faAddressBook, faTachometerAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
import baseURL from '../../url';

export default function CardsCantidad() {
    const [productos, setProductos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categorias, setCategoras] = useState([]);
    const [contactos, setContactos] = useState([]);
    const [codigos, setCodigos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDashboardStats();
    }, []);

    const cargarDashboardStats = async () => {
        setLoading(true);

        try {
            const [productosRes, usuariosRes, bannersRes, categoriasRes, contactosRes, codigosRes] = await Promise.all([
                fetch(`${baseURL}/productosGet.php`),
                fetch(`${baseURL}/usuariosGet.php`),
                fetch(`${baseURL}/bannersGet.php`),
                fetch(`${baseURL}/categoriasGet.php`),
                fetch(`${baseURL}/contactoGet.php`),
                fetch(`${baseURL}/codigosGet.php`),
            ]);

            const [productosData, usuariosData, bannersData, categoriasData, contactosData, codigosData] = await Promise.all([
                productosRes.json(),
                usuariosRes.json(),
                bannersRes.json(),
                categoriasRes.json(),
                contactosRes.json(),
                codigosRes.json(),
            ]);

            setProductos(productosData.productos || []);
            setUsuarios(usuariosData.usuarios || []);
            setBanners(bannersData.banner || []);
            setCategoras(categoriasData.categorias || []);
            setContactos(contactosData.contacto || []);
            setCodigos(codigosData.codigos || []);
        } catch (error) {
            console.error('Error al cargar estadísticas del dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { label: 'Usuarios', count: usuarios.length, icon: faUser, to: '/dashboard/usuarios' },
        { label: 'Productos', count: productos.length, icon: faBook, to: '/dashboard/productos' },
        { label: 'Banners', count: banners.length, icon: faImage, to: '/dashboard/banners' },
        { label: 'Categorías', count: categorias.length, icon: faTachometerAlt, to: '/dashboard/categorias' },
        { label: 'Contactos', count: contactos.length, icon: faAddressBook, to: '/dashboard/contacto' },
        { label: 'Códigos', count: codigos.length, icon: faCode, to: '/dashboard/codigos' },
    ];

    return (
        <div className='dashboardStats'>
            <div className='dashboardStats__header'>
                <h2>Resumen general</h2>
                <p>Accede rápido a cada módulo del panel administrativo.</p>
            </div>

            <div className='dashboardStats__grid'>
                {cards.map((card) => (
                    <Anchor to={card.to} className='dashboardStatCard' key={card.label}>
                        <span className='dashboardStatCard__icon'>
                            <FontAwesomeIcon icon={card.icon} className='icons' />
                        </span>

                        <div className='dashboardStatCard__content'>
                            <h3>{card.label}</h3>
                            <h2>{loading ? '...' : card.count}</h2>
                        </div>
                    </Anchor>
                ))}
            </div>

        </div>
    )
}
