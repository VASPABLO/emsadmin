import React, { useEffect, useState } from 'react';
import '../adminTables.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './ContactoData.css';
import 'jspdf-autotable';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import NewContact from '../NewContact/NewContact';

export default function ContactoData() {
    const [contactos, setContactos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoTelefono, setNuevoTelefono] = useState('');
    const [contacto, setContacto] = useState({});

    useEffect(() => {
        cargarContacto();
    }, []);

    const cargarContacto = () => {
        apiFetch(`${baseURL}/contacto/contactoGet.php`, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                setContactos(data.contacto || []);
            })
            .catch((error) => console.error('Error al cargar contactos:', error));
    };

    const eliminarContacto = (idContacto) => {
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
                apiFetch(`${baseURL}/contacto/contactoDelete.php?idContacto=${idContacto}`, {
                    method: 'DELETE',
                })
                    .then((response) => response.json())
                    .then((data) => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarContacto();
                    })
                    .catch((error) => {
                        console.error('Error al eliminar contacto:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setContacto(item);
        setNuevoTelefono(item.telefono);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };



    const handleUpdateText = (idContacto) => {
        const payload = {
            nombre: contacto.nombre,
            telefono: nuevoTelefono !== '' ? nuevoTelefono : contacto.telefono,
            instagram: contacto.instagram,
            email: contacto.email,
            direccion: contacto.direccion,
            facebook: contacto.facebook,
        };

        apiFetch(`${baseURL}/contacto/contactoPut.php?idContacto=${idContacto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {
                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarContacto();
                    cerrarModal();
                }
            })
            .catch((error) => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    return (
        <div>
            <ToastContainer />

            <NewContact onCreated={cargarContacto} />

            {modalVisible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <div className='deFlexBtnsModal'>
                                <button className='selected'>Editar telefono</button>
                            </div>
                            <span className='close' onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>

                        <div className='sectiontext' style={{ display: 'flex' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Telefono</legend>
                                    <input
                                        type='text'
                                        value={nuevoTelefono !== '' ? nuevoTelefono : contacto.telefono}
                                        onChange={(e) => setNuevoTelefono(e.target.value)}
                                    />
                                </fieldset>
                            </div>

                            <button className='btnPost' onClick={() => handleUpdateText(contacto.idContacto)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='table-container'>
                <table className='table tableCards'>
                    <thead>
                        <tr>
                            <th>Id Contacto</th>
                            <th>Nombre</th>
                            <th>Telefono</th>
                            <th>Instagram</th>
                            <th>Facebook</th>
                            <th>Email</th>
                            <th>Direccion</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {contactos.map((item) => (
                            <tr key={item.idContacto}>
                                <td data-label='ID'>{item.idContacto}</td>
                                <td data-label='Nombre'>{item.nombre}</td>
                                <td data-label='Teléfono'>{item.telefono}</td>
                                <td data-label='Instagram'>{item.instagram}</td>
                                <td data-label='Facebook'>{item.facebook}</td>
                                <td data-label='Email'>{item.email}</td>
                                <td data-label='Dirección'>{item.direccion}</td>
                                <td className='tableCards__actions'>
                                    <button className='eliminar' onClick={() => eliminarContacto(item.idContacto)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>

                                    <button className='editar' onClick={() => abrirModal(item)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
