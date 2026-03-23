import React, { useState } from 'react';
import './NewCategoria.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faXmark,
    faTags,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';

export default function NewCategoria({ onCreated }) {
    const [mensaje, setMensaje] = useState('');
    const [categoria, setCategoria] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => {
        setCategoria('');
        setMensaje('');
        setModalOpen(!modalOpen);
    };

    const crear = async () => {
        if (!categoria.trim()) {
            toast.error('Debes ingresar una categoría');
            return;
        }

        const formData = new FormData();
        formData.append('categoria', categoria.trim());

        setMensaje('Creando categoría...');

        try {
            const response = await fetch(`${baseURL}/categoriasPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                toast.success(data.mensaje);
                toggleModal();

                if (onCreated) {
                    onCreated();
                }
            } else if (data.error) {
                setMensaje('');
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className='newCategoria'>
            <button onClick={toggleModal} className='newCategoria__trigger' type='button'>
                <FontAwesomeIcon icon={faPlus} />
                <span>Agregar categoría</span>
            </button>

            {modalOpen && (
                <div className='newCategoriaModalOverlay' onClick={toggleModal}>
                    <div className='newCategoriaModal' onClick={(event) => event.stopPropagation()}>
                        <div className='newCategoriaModal__header'>
                            <div>
                                <span className='newCategoriaModal__tag'>Nueva categoría</span>
                                <h3>Crear categoría</h3>
                                <p>Agrega una categoría para organizar mejor el catálogo.</p>
                            </div>

                            <button className='newCategoriaModal__close' onClick={toggleModal} type='button'>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <form id='crearFormCategoria' className='newCategoriaForm'>
                            <div className='newCategoriaField'>
                                <label htmlFor='categoriaNombre'>Nombre de categoría</label>
                                <div className='newCategoriaField__inputWrap'>
                                    <FontAwesomeIcon icon={faTags} />
                                    <input
                                        id='categoriaNombre'
                                        type='text'
                                        name='categoria'
                                        value={categoria}
                                        onChange={(event) => setCategoria(event.target.value)}
                                        placeholder='Ej: Hidráulica'
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className='newCategoriaModal__footer'>
                                <button type='button' className='modalBtn modalBtn--ghost' onClick={toggleModal}>
                                    Cancelar
                                </button>

                                {mensaje ? (
                                    <button type='button' className='modalBtn modalBtn--primary' disabled>
                                        {mensaje}
                                    </button>
                                ) : (
                                    <button type='button' onClick={crear} className='modalBtn modalBtn--primary'>
                                        <FontAwesomeIcon icon={faUpload} />
                                        Crear categoría
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
