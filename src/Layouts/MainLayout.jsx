import React, { useState, useEffect } from 'react';
import Spiner from '../Components/Admin/Spiner/Spiner';
import { Navigate, Outlet } from 'react-router-dom';
import baseURL from '../Components/url';
import { AuthProvider } from '../Context/AuthContext';

const ROLES_CON_ACCESO_DASHBOARD = ['vendedor', 'cajera', 'admin'];

export default function MainLayout() {
    const [usuario, setUsuario] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // MODO DESARROLLO (comentado)
        // setUsuario({ idUsuario: 'dev' });
        // setLoading(false);

        // MODO PRODUCCION ACTIVO
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${baseURL}/auth/userLogued.php`, {
                    credentials: 'include',
                    cache: 'no-store',
                });

                const data = await response.json();

                setUsuario(data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setUsuario({});
                setLoading(false);
            }
        };

        const handleAuthChanged = () => {
            fetchData();
        };

        fetchData();
        window.addEventListener('auth:changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth:changed', handleAuthChanged);
        };
    }, []);

    if (loading) {
        return <Spiner />;
    }
    // Bloquea acceso al admin sin sesión activa, o con un rol sin acceso al panel (ej. 'usuario').
    if (!usuario || !usuario.idUsuario || !ROLES_CON_ACCESO_DASHBOARD.includes(usuario.rol)) {
        return <Navigate to='/' replace />;
    }
    // Si hay usuario logueado con un rol permitido, muestra el panel admin
    return (
        <AuthProvider usuario={usuario}>
            <Outlet />
        </AuthProvider>
    );
}
