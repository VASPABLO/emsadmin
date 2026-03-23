import React, { useEffect, useState } from 'react';
import './UsuariosMain.css';
import { Link as Anchor } from 'react-router-dom';
import baseURL from '../../url';

export default function UsuariosData() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = () => {
        setLoading(true);

        fetch(`${baseURL}/usuariosGet.php`, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                const recientes = [...(data.usuarios || [])].reverse().slice(0, 5);
                setUsuarios(recientes);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al cargar usuarios:', error);
                setLoading(false);
            });
    };

    return (

        <div className='dashboardUsers'>
            <div className='dashboardUsers__header'>
                <h3>Ultimos {usuarios?.length} registros</h3>
                <Anchor to={`/dashboard/usuarios`} className='dashboardCardLink'>
                    Ver más
                </Anchor>
            </div>

            <div className='dashboardTableWrap'>
                <table className='dashboardTable'>
                    <thead>
                        <tr>
                            <th>ID Usuario</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan='5' className='dashboardTable__state'>Cargando usuarios...</td>
                            </tr>
                        ) : usuarios.length === 0 ? (
                            <tr>
                                <td colSpan='5' className='dashboardTable__state'>No hay usuarios recientes.</td>
                            </tr>
                        ) : usuarios.map((usuario) => (
                            <tr key={usuario.idUsuario}>
                                <td>{usuario.idUsuario}</td>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.email}</td>
                                <td>
                                    <span className={`roleBadge roleBadge--${String(usuario?.rol || '').toLowerCase()}`}>
                                        {usuario?.rol}
                                    </span>
                                </td>
                                <td>{usuario.createdAt || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
}
