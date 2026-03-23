import React, { useEffect, useRef, useState } from 'react';
import './NewProduct.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faXmark,
    faImage,
    faCloudArrowUp,
    faUpload,
    faTrash,
    faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';

export default function NewProduct({ onCreated }) {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview1, setImagenPreview1] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [isImage1Selected, setIsImage1Selected] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [categorias, setCategoras] = useState([]);
    const fileInputRef = useRef(null);

    const toggleModal = () => {
        if (modalOpen && imagenPreview1) {
            URL.revokeObjectURL(imagenPreview1);
        }

        setModalOpen(!modalOpen);

        if (modalOpen) {
            setImagenPreview1(null);
            setIsImage1Selected(false);
            setMensaje('');
        }
    };

    const handleImagenChange = (event, setImagenPreview, setIsImageSelected) => {
        const file = event.target.files[0];

        if (imagenPreview1) {
            URL.revokeObjectURL(imagenPreview1);
        }

        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagenPreview(previewURL);
            setIsImageSelected(true);
        } else {
            setImagenPreview(null);
            setIsImageSelected(false);
        }
    };

    const limpiarImagen = () => {
        if (imagenPreview1) {
            URL.revokeObjectURL(imagenPreview1);
        }

        setImagenPreview1(null);
        setIsImage1Selected(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const crear = async () => {
        const form = document.getElementById('crearFormProduct');
        const formData = new FormData(form);
        setMensaje('');

        if (

            !formData.get('titulo') ||
            !formData.get('idCategoria') ||
            !formData.get('imagen1')
        ) {
            toast.error('Por favor, complete todos los campos correctamente.');
            return;
        }

        setMensaje('Creando producto...');

        try {
            const response = await fetch(`${baseURL}/productosPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                form.reset();
                limpiarImagen();
                setTitulo('');
                setDescripcion('');
                setCategoria('');
                setModalOpen(false);
                toast.success(data.mensaje);

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


    const handleCategoriaChange = (e) => {
        setCategoria(e.target.value);
    };
    useEffect(() => {
        cargarCategoria();
    }, []);


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };


    return (
        <div className='newProduct'>
            <button onClick={toggleModal} className='newProduct__trigger' type='button'>
                <FontAwesomeIcon icon={faPlus} />
                <span>Agregar producto</span>
            </button>

            {modalOpen && (
                <div className='newProductModalOverlay' onClick={toggleModal}>
                    <div className='newProductModal' onClick={(event) => event.stopPropagation()}>
                        <div className='newProductModal__header'>
                            <div>
                                <span className='newProductModal__tag'>Nuevo producto</span>
                                <h3>Crear producto</h3>
                                <p>Completa la información para agregarlo al catálogo.</p>
                            </div>

                            <button className='newProductModal__close' onClick={toggleModal} type='button'>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <form id='crearFormProduct' className='newProductForm'>
                            <div className='newProductForm__grid'>
                                <label className='fieldBox'>
                                    <span>Título (obligatorio)</span>
                                    <input
                                        type='text'
                                        id='titulo'
                                        name='titulo'
                                        required
                                        value={titulo}
                                        onChange={(event) => setTitulo(event.target.value)}
                                    />
                                </label>

                                <label className='fieldBox'>
                                    <span>Categoría (obligatorio)</span>
                                    <select
                                        id='idCategoria'
                                        name='idCategoria'
                                        value={categoria}
                                        onChange={handleCategoriaChange}
                                        required
                                    >
                                        <option value=''>Selecciona una categoría</option>
                                        {categorias.map((item) => (
                                            <option key={item.idCategoria} value={item.idCategoria}>{item.categoria}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className='fieldBox fieldBox--full'>
                                    <span>Descripción</span>
                                    <textarea
                                        id='descripcion'
                                        name='descripcion'
                                        required
                                        value={descripcion}
                                        onChange={(event) => setDescripcion(event.target.value)}
                                        placeholder='Descripción del producto'
                                    />
                                </label>
                            </div>

                            <div className='uploadCard'>
                                <div className='uploadCard__icon'>
                                    <FontAwesomeIcon icon={faCloudArrowUp} />
                                </div>

                                <div className='uploadCard__text'>
                                    <h4>Imagen principal</h4>
                                    <p>Sube la imagen destacada del producto (JPG, PNG o WEBP).</p>
                                </div>

                                <label htmlFor='imagenProducto' className='uploadCard__button'>
                                    <FontAwesomeIcon icon={faUpload} />
                                    Elegir archivo
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    id='imagenProducto'
                                    name='imagen1'
                                    accept='image/*'
                                    onChange={(event) => handleImagenChange(event, setImagenPreview1, setIsImage1Selected)}
                                    required
                                    hidden
                                />
                            </div>

                            {isImage1Selected ? (
                                <div className='previewCard'>
                                    <div className='previewCard__top'>
                                        <div className='previewCard__title'>
                                            <FontAwesomeIcon icon={faImage} />
                                            <span>Vista previa</span>
                                        </div>

                                        <button
                                            type='button'
                                            className='previewCard__remove'
                                            onClick={limpiarImagen}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Quitar
                                        </button>
                                    </div>

                                    <div className='previewCard__imageWrap'>
                                        <img src={imagenPreview1} alt='Vista previa de producto' />
                                    </div>
                                </div>
                            ) : (
                                <div className='emptyPreview'>
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                    <p>Aún no has seleccionado una imagen.</p>
                                </div>
                            )}

                            <div className='newProductModal__footer'>
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
                                        Crear producto
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

