import React, { useState, useEffect } from 'react';
import './InfoUserMain.css';
import baseURL from '../../url';
import { Link as Anchor } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faEnvelope, faUserTag } from '@fortawesome/free-solid-svg-icons';

export default function InfoUserMain() {
    const [usuario, setUsuario] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${baseURL}/userLogued.php`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setUsuario(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al obtener datos:', error);
                setLoading(false);
            });
    }, []);

    const firstLetter = (usuario?.nombre || '?').slice(0, 1).toUpperCase();

    return (
        <Anchor to='' className='dashboardProfileCard'>
            <div className='dashboardProfileCard__header'>
                <span className='dashboardProfileCard__avatar'>{loading ? '...' : firstLetter}</span>

                <div>
                    <h3>Perfil activo</h3>
                    <p>Sesión actual del panel administrativo</p>
                </div>
            </div>

            {loading ? (
                <div className='dashboardProfileCard__state'>Cargando información del usuario...</div>
            ) : usuario.idUsuario ? (
                <div className='dashboardProfileCard__content'>
                    <div className='dashboardProfileCard__row'>
                        <FontAwesomeIcon icon={faUserShield} />
                        <span>{usuario.nombre || '-'}</span>
                    </div>

                    <div className='dashboardProfileCard__row'>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{usuario.email || '-'}</span>
                    </div>

                    <div className='dashboardProfileCard__row'>
                        <FontAwesomeIcon icon={faUserTag} />
                        <span className={`roleBadge roleBadge--${String(usuario?.rol || '').toLowerCase()}`}>
                            {usuario.rol || 'Sin rol'}
                        </span>
                    </div>
                </div>
            ) : (
                <div className='dashboardProfileCard__state'>No hay información del usuario logueado.</div>
            )}
        </Anchor>
    );
}
