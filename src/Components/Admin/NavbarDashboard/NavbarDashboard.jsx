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
    faGlobe
} from '@fortawesome/free-solid-svg-icons';
import logo from '../../../images/logo.png';
import Logout from '../Logout/Logout';

export default function Navbar() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { to: '/dashboard', label: 'Inicio', icon: faHome },
        { to: '/home', label: 'Sitio web', icon: faGlobe },
        { to: '/dashboard/productos', label: 'Productos', icon: faBoxOpen },
        { to: '/dashboard/pedidos', label: 'Pedidos', icon: faClipboardList },
        { to: '/dashboard/categorias', label: 'Categorías', icon: faLayerGroup },
        { to: '/dashboard/banners', label: 'Banners', icon: faImage },
        { to: '/dashboard/destacados', label: 'Destacados', icon: faStar },
        { to: '/dashboard/contacto', label: 'Contacto', icon: faAddressBook },
        { to: '/dashboard/usuarios', label: 'Usuarios', icon: faUser },
        // { to: '/dashboard/codigos', label: 'Códigos', icon: faCode },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <>
            <div className="mobileAdminTopbar">
                <button
                    type="button"
                    className="sidebarToggleBtn"
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                    aria-label={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
                    aria-expanded={isSidebarOpen}
                >
                    <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
                </button>

                <Anchor to="/dashboard" className="mobileAdminBrand" onClick={() => setIsSidebarOpen(false)}>
                    <img src={logo} alt="Logo EMS" />
                    <span>Panel Admin</span>
                </Anchor>
            </div>

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