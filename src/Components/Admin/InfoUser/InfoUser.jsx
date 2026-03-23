import React, { useEffect, useMemo, useState } from 'react';
import './InfoUser.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from 'react-router-dom';
import baseURL from '../../url';

export default function InfoUser() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${baseURL}/userLogued.php`);

            if (!response.ok) {
                throw new Error('No se pudo obtener la información del usuario');
            }

            const data = await response.json();
            setUsuario(data || null);
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            setUsuario(null);
        } finally {
            setLoading(false);
        }
    };

    const nombreMostrado = useMemo(() => {
        if (!usuario?.nombre) return 'Mi Perfil';
        return usuario.nombre.length > 14
            ? `${usuario.nombre.slice(0, 14)}...`
            : usuario.nombre;
    }, [usuario]);

    const inicialUsuario = useMemo(() => {
        if (!usuario?.nombre) return 'U';
        return usuario.nombre.charAt(0).toUpperCase();
    }, [usuario]);

    if (loading) {
        return (
            <div className="userSession loadingUserSession">
                <div className="userAvatarSkeleton"></div>
                <div className="userTextSkeleton"></div>
            </div>
        );
    }

    return (
        <Anchor to="/dashboard/perfil" className="btn-sesion">
            <div className="userAvatar">
                {usuario?.nombre ? (
                    <span>{inicialUsuario}</span>
                ) : (
                    <FontAwesomeIcon icon={faUser} className="icon" />
                )}
            </div>

            <div className="userInfoText">
                <span className="userLabel">Cuenta</span>
                <strong>{nombreMostrado}</strong>
            </div>
        </Anchor>
    );
}