import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faAddressBook, faSync, faPhoneVolume } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './ContactoData.css';
import 'jspdf-autotable';
import baseURL from '../../url';
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
        fetch(`${baseURL}/contactoGet.php`, {
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
                fetch(`${baseURL}/contactoDelete.php?idContacto=${idContacto}`, {
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

        fetch(`${baseURL}/contactoPut.php?idContacto=${idContacto}`, {
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
        <section className='contactoAdmin'>
            <ToastContainer />

            <NewContact onCreated={cargarContacto} />

            <div className='contactoAdmin__header'>
                <div>
                    <span className='contactoAdmin__badge'>
                        <FontAwesomeIcon icon={faAddressBook} />
                        Gestión de contacto
                    </span>
                    <h1>Contacto</h1>
                    <p>Actualiza los canales de contacto visibles en la tienda y WhatsApp.</p>
                </div>

                <div className='contactoAdmin__actions'>
                    <button className='adminActionBtn adminActionBtn--ghost' onClick={cargarContacto}>
                        <FontAwesomeIcon icon={faSync} />
                        Recargar
                    </button>
                </div>
            </div>

            <div className='contactoAdmin__topbar'>
                <div className='statCard'>
                    <span>Total contactos</span>
                    <strong>{contactos.length}</strong>
                </div>
            </div>

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

                            <button type='button' className='btnPost' onClick={() => handleUpdateText(contacto.idContacto)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='table-container'>
                <div className='tableHeaderLite'>
                    <h3><FontAwesomeIcon icon={faPhoneVolume} /> Tabla de contacto</h3>
                    <p>Edita los datos y elimina registros obsoletos.</p>
                </div>

                <table className='table'>
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
                                <td>{item.idContacto}</td>
                                <td>{item.nombre}</td>
                                <td>{item.telefono}</td>
                                <td>{item.instagram}</td>
                                <td>{item.facebook}</td>
                                <td>{item.email}</td>
                                <td>{item.direccion}</td>
                                <td>
                                    <button className='eliminar' onClick={() => eliminarContacto(item.idContacto)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>

                                    <button className='editar' onClick={() => abrirModal(item)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {contactos.length === 0 && (
                            <tr>
                                <td colSpan='8' className='emptyTableCell'>No hay contactos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
