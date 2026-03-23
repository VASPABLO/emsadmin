import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faEdit,
    faSync,
    faTags,
    faMagnifyingGlass,
    faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './CategoriasData.css';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewCategoria from '../NewCategoria/NewCategoria';

export default function CategoriasData() {
    const [categorias, setCategoras] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [categoria, setCategoria] = useState({});
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCategoria();
    }, []);

    const cargarCategoria = () => {
        setLoading(true);
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                setCategoras(data.categorias || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al cargar categorías:', error);
                setLoading(false);
            });
    };

    const eliminarCategoria = (idCategoria) => {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: 'Esta acción no se podrá revertir.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            borderRadius: 18,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/categoriaDelete.php?idCategoria=${idCategoria}`, {
                    method: 'DELETE',
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            toast.error(data.error);
                            return;
                        }

                        Swal.fire({
                            title: 'Eliminado',
                            text: data.mensaje,
                            icon: 'success',
                            confirmButtonColor: '#0f172a',
                            borderRadius: 18,
                        });

                        cargarCategoria();
                    })
                    .catch((error) => {
                        console.error('Error al eliminar categoría:', error);
                        toast.error(error.message);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setCategoria(item);
        setNuevaCategoria(item.categoria);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleUpdateText = (idCategoria) => {
        const payload = {
            categoria: nuevaCategoria !== '' ? nuevaCategoria : categoria.categoria,
        };

        fetch(`${baseURL}/categoriaPut.php?idCategoria=${idCategoria}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    Swal.fire('Error!', data.error, 'error');
                } else {
                    Swal.fire('Editado!', data.mensaje, 'success');
                    cargarCategoria();
                    cerrarModal();
                }
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const categoriasFiltradas = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) {
            return categorias;
        }

        return categorias.filter((item) => (
            String(item?.idCategoria || '').includes(query) ||
            String(item?.categoria || '').toLowerCase().includes(query)
        ));
    }, [categorias, searchText]);

    return (
        <section className='categoriasAdmin'>
            <ToastContainer />

            <NewCategoria onCreated={cargarCategoria} />

            <div className='categoriasAdmin__header'>
                <div>
                    <span className='categoriasAdmin__badge'>
                        <FontAwesomeIcon icon={faLayerGroup} />
                        Organización del catálogo
                    </span>
                    <h1>Categorías</h1>
                    <p>Gestiona las categorías que estructuran los productos del catálogo.</p>
                </div>

                <div className='categoriasAdmin__actions'>
                    <button className='adminActionBtn adminActionBtn--ghost' onClick={cargarCategoria}>
                        <FontAwesomeIcon icon={faSync} />
                        Recargar
                    </button>
                </div>
            </div>

            <div className='categoriasAdmin__topbar'>
                <div className='categoriasAdmin__search'>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input
                        type='text'
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder='Buscar por ID o nombre de categoría'
                    />
                </div>

                <div className='categoriasAdmin__stats'>
                    <div className='statCard'>
                        <span>Total</span>
                        <strong>{categorias.length}</strong>
                    </div>

                    <div className='statCard'>
                        <span>Filtradas</span>
                        <strong>{categoriasFiltradas.length}</strong>
                    </div>
                </div>
            </div>

            {modalVisible && (
                <div className='adminModalOverlay' onClick={cerrarModal}>
                    <div className='adminModal' onClick={(event) => event.stopPropagation()}>
                        <div className='adminModal__header'>
                            <div>
                                <span className='adminModal__tag'>Editar categoría</span>
                                <h3>Actualizar información</h3>
                                <p>Modifica el nombre para mantener organizado el catálogo.</p>
                            </div>

                            <button className='adminModal__close' onClick={cerrarModal} type='button'>
                                &times;
                            </button>
                        </div>

                        <div className='adminModal__body'>
                            <div className='modernField'>
                                <label>ID de categoría</label>
                                <input
                                    type='text'
                                    value={categoria?.idCategoria || ''}
                                    disabled
                                />
                            </div>

                            <div className='modernField'>
                                <label>Nombre de categoría</label>
                                <input
                                    type='text'
                                    value={nuevaCategoria !== '' ? nuevaCategoria : categoria.categoria}
                                    onChange={(event) => setNuevaCategoria(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className='adminModal__footer'>
                            <button className='modalBtn modalBtn--ghost' type='button' onClick={cerrarModal}>Cancelar</button>
                            <button className='modalBtn modalBtn--primary' type='button' onClick={() => handleUpdateText(categoria.idCategoria)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='categoriasAdmin__tableCard'>
                <div className='categoriasAdmin__tableHeader'>
                    <h3>Categorías registradas</h3>
                    <p>Edita o elimina categorías según sea necesario.</p>
                </div>

                <div className='table-responsive'>
                    <table className='modernTable'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Categoría</th>
                                <th className='align-right'>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan='3' className='tableState'>Cargando categorías...</td>
                                </tr>
                            ) : categoriasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan='3' className='tableState'>No hay categorías para mostrar.</td>
                                </tr>
                            ) : categoriasFiltradas.map((item) => (
                                <tr key={item.idCategoria}>
                                    <td>
                                        <span className='idBadge'>#{item.idCategoria}</span>
                                    </td>

                                    <td>
                                        <div className='categoriaCell'>
                                            <span className='categoriaIcon'>
                                                <FontAwesomeIcon icon={faTags} />
                                            </span>

                                            <div>
                                                <strong>{item.categoria}</strong>
                                                <span>Categoría de productos</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className='align-right'>
                                        <div className='tableActions'>
                                            <button className='tableBtn tableBtn--edit' type='button' onClick={() => abrirModal(item)} title='Editar categoría'>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>

                                            <button className='tableBtn tableBtn--delete' type='button' onClick={() => eliminarCategoria(item.idCategoria)} title='Eliminar categoría'>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
