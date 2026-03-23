import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTicket, faPercent, faSync, faTableList } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import NewCodigo from '../NewCodigo/NewCodigo';
import moneda from '../../moneda';
import './CodigosData.css';

export default function CodigosData() {
    const [codigos, setCodigos] = useState([]);

    useEffect(() => {
        cargarCodigos();
    }, []);

    const cargarCodigos = () => {
        fetch(`${baseURL}/codigosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCodigos(data.codigos || []);
            })
            .catch(error => console.error('Error al cargar códigos:', error));
    };

    const eliminarCodigo = (idCodigo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/codigosDelete.php?idCodigo=${idCodigo}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarCodigos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar código:', error);
                        toast.error(error);
                    });
            }
        });
    };




    return (
        <section className='codigosAdmin'>
            <ToastContainer />
            <NewCodigo />

            <div className='codigosAdmin__header'>
                <div>
                    <span className='codigosAdmin__badge'>
                        <FontAwesomeIcon icon={faTicket} />
                        Gestión de promociones
                    </span>
                    <h1>Códigos</h1>
                    <p>Controla los códigos de descuento disponibles para tus pedidos.</p>
                </div>

                <div className='codigosAdmin__actions'>
                    <button className='adminActionBtn adminActionBtn--ghost' onClick={cargarCodigos}>
                        <FontAwesomeIcon icon={faSync} />
                        Recargar
                    </button>
                </div>
            </div>

            <div className='codigosAdmin__topbar'>
                <div className='statCard'>
                    <span>Total códigos</span>
                    <strong>{codigos.length}</strong>
                </div>
            </div>

            <div className='table-container'>
                <div className='tableHeaderLite'>
                    <h3><FontAwesomeIcon icon={faTableList} /> Tabla de códigos</h3>
                    <p>Elimina códigos inactivos o desactualizados.</p>
                </div>

                <table className='table'>
                    <thead>
                        <tr>
                            <th>Id Código</th>
                            <th>Código</th>
                            <th>Descuento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codigos.map(item => (
                            <tr key={item.idCodigo}>
                                <td>{item.idCodigo}</td>
                                <td>{item.codigo}</td>
                                <td className='codigoPriceCell'>
                                    <FontAwesomeIcon icon={faPercent} /> {moneda} {item.descuento?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                </td>
                                <td>
                                    <button className='eliminar' onClick={() => eliminarCodigo(item.idCodigo)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>

                                </td>
                            </tr>
                        ))}

                        {codigos.length === 0 && (
                            <tr>
                                <td colSpan='4' className='emptyTableCell'>No hay códigos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
