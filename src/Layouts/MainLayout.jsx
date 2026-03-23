import React, { useState, useEffect } from 'react';
import Spiner from '../Components/Admin/Spiner/Spiner';
import { Outlet } from 'react-router-dom';
import Auth from '../Components/Admin/Auth/Auth';
import baseURL from '../Components/url';
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
                let data = null;

                for (const endpoint of [
                    new URL('userLogued.php', `${baseURL}/`).toString(),
                    new URL('public/userLogued.php', `${baseURL}/`).toString(),
                    new URL('build/userLogued.php', `${baseURL}/`).toString(),
                ]) {
                    const response = await fetch(endpoint, {
                        credentials: 'include',
                        cache: 'no-store',
                    });

                    if (!response.ok) {
                        continue;
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (!contentType.includes('application/json')) {
                        continue;
                    }

                    data = await response.json();
                    break;
                }

                if (!data) {
                    throw new Error('No se encontró un endpoint de sesión válido en producción');
                }

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
    // Si no hay usuario logueado, muestra Auth
    if (!usuario || !usuario.idUsuario) {
        return <Auth />;
    }
    // Si hay usuario logueado, muestra el panel admin
    return (
        <div>
            <Outlet />
        </div>
    );
}
