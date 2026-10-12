import React, { useEffect, useState } from 'react';
import './NavbarDashboard.css';
import { Link as Anchor, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faTimes,
    faHome,
    faUser,
    faBoxOpen,
    faImage,
    faAddressBook,
    faLayerGroup,
    faCode,
    faClipboardList,
    faStar,
    faCartPlus,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';
import logo from '../../../images/logo.png';
import Logout from '../Logout/Logout';
import { useAuth } from '../../../Context/AuthContext';

const TODOS_LOS_ROLES = ['vendedor', 'cajera', 'admin'];

export default function Navbar() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { usuario } = useAuth();

    const menuItems = [
        { to: '/dashboard', label: 'Inicio', icon: faHome, roles: TODOS_LOS_ROLES },
        { to: '/dashboard/nuevo-pedido', label: 'Nuevo pedido', icon: faCartPlus, roles: ['vendedor', 'admin'] },
        { to: '/dashboard/productos', label: 'Productos', icon: faBoxOpen, roles: ['admin'] },
        { to: '/dashboard/pedidos', label: 'Pedidos', icon: faClipboardList, roles: ['cajera', 'admin'] },
        { to: '/dashboard/categorias', label: 'Categorías', icon: faLayerGroup, roles: ['admin'] },
        { to: '/dashboard/banners', label: 'Banners', icon: faImage, roles: ['admin'] },
        { to: '/dashboard/marcas', label: 'Marcas', icon: faStar, roles: ['admin'] },
        { to: '/dashboard/destacados', label: 'Destacados', icon: faStar, roles: ['admin'] },
        { to: '/dashboard/contacto', label: 'Contacto', icon: faAddressBook, roles: ['admin'] },
        { to: '/dashboard/usuarios', label: 'Usuarios', icon: faUser, roles: ['admin'] },
        { to: '/dashboard/reportes', label: 'Reportes', icon: faChartLine, roles: ['admin'] },
        // { to: '/dashboard/codigos', label: 'Códigos', icon: faCode, roles: ['admin'] },
    ].filter((item) => item.roles.includes(usuario?.rol));

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <>
            <button
                type="button"
                className="sidebarToggleBtn"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-label={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
                aria-expanded={isSidebarOpen}
            >
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
            </button>

            {isSidebarOpen && (
                <button
                    type="button"
                    className="sidebarOverlay"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Cerrar menú lateral"
                />
            )}

            <aside className={`navbarDashboard ${isSidebarOpen ? 'is-open' : ''}`}>
                <div className="sidebarHeader">
                    <Anchor to="/dashboard" className="logoBox" onClick={() => setIsSidebarOpen(false)}>
                        <img src={logo} alt="Logo EMS" />
                        <div className="logoText">
                            <strong>EMS</strong>
                            <span>Panel Admin</span>
                        </div>
                    </Anchor>
                </div>

                <nav className="sidebarNav">
                    {menuItems.map((item) => (
                        <Anchor
                            key={item.to}
                            to={item.to}
                            className={`sidebarLink ${isActive(item.to) ? 'activeLink' : ''}`}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className="sidebarIcon">
                                <FontAwesomeIcon icon={item.icon} />
                            </span>
                            <span className="sidebarLabel">{item.label}</span>
                        </Anchor>
                    ))}
                </nav>

                <div className="sidebarFooter">
                    <Logout />
                </div>
            </aside>
        </>
    );
}