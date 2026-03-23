import React, { useRef, useState } from 'react';
import './NewBanner.css';
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
} from '@fortawesome/free-solid-svg-icons';

export default function NewBanner({ onCreated }) {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const toggleModal = () => {
        if (modalOpen && imagenPreview) {
            URL.revokeObjectURL(imagenPreview);
        }

        setModalOpen(!modalOpen);

        if (modalOpen) {
            setImagenPreview(null);
            setIsImageSelected(false);
            setMensaje('');
        }
    };

    const handleImagenChange = (event) => {
        const file = event.target.files[0];

        if (imagenPreview) {
            URL.revokeObjectURL(imagenPreview);
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
        if (imagenPreview) {
            URL.revokeObjectURL(imagenPreview);
        }

        setImagenPreview(null);
        setIsImageSelected(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const crear = async () => {
        const form = document.getElementById('crearFormBanner');
        const formData = new FormData(form);

        if (!formData.get('imagen') || !formData.get('imagen').name) {
            toast.error('Debe seleccionar una imagen');
            return;
        }

        setMensaje('Subiendo banner...');

        try {
            const response = await fetch(`${baseURL}/bannersPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                form.reset();
                limpiarImagen();
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

    return (
        <div className='newBanner'>
            <button onClick={toggleModal} className='newBanner__trigger' type='button'>
                <FontAwesomeIcon icon={faPlus} />
                <span>Agregar banner</span>
            </button>

            {modalOpen && (
                <div className='newBannerModalOverlay' onClick={toggleModal}>
                    <div className='newBannerModal' onClick={(event) => event.stopPropagation()}>
                        <div className='newBannerModal__header'>
                            <div>
                                <span className='newBannerModal__tag'>Nuevo banner</span>
                                <h3>Subir imagen de banner</h3>
                                <p>Agrega una imagen para mostrarla en la portada principal.</p>
                            </div>

                            <button className='newBannerModal__close' onClick={toggleModal} type='button'>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <form id='crearFormBanner' className='newBannerForm'>
                            <div className='uploadCard'>
                                <div className='uploadCard__icon'>
                                    <FontAwesomeIcon icon={faCloudArrowUp} />
                                </div>

                                <div className='uploadCard__text'>
                                    <h4>Selecciona una imagen</h4>
                                    <p>Formatos recomendados: JPG, PNG o WEBP.</p>
                                </div>

                                <label htmlFor='imagenBanner' className='uploadCard__button'>
                                    <FontAwesomeIcon icon={faUpload} />
                                    Elegir archivo
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    id='imagenBanner'
                                    name='imagen'
                                    accept='image/*'
                                    onChange={handleImagenChange}
                                    required
                                    hidden
                                />
                            </div>

                            {isImageSelected ? (
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
                                        <img src={imagenPreview} alt='Vista previa' />
                                    </div>
                                </div>
                            ) : (
                                <div className='emptyPreview'>
                                    <FontAwesomeIcon icon={faImage} />
                                    <p>Aún no has seleccionado una imagen.</p>
                                </div>
                            )}

                            <div className='newBannerModal__footer'>
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
                                        Subir banner
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
