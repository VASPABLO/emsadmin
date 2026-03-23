import React, { useRef, useState } from 'react';
import './NewDestacado.css';
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
  faTrash
} from '@fortawesome/free-solid-svg-icons';

const buildEndpointCandidates = (fileName) => [
  new URL(fileName, `${baseURL}/`).toString(),
  new URL(`public/${fileName}`, `${baseURL}/`).toString(),
  new URL(`build/${fileName}`, `${baseURL}/`).toString(),
];

const postFormDataWithFallback = async (fileName, formData) => {
  for (const endpoint of buildEndpointCandidates(fileName)) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        continue;
      }

      const data = await response.json();
      return { data, endpoint };
    } catch (error) {
      // Continue trying alternative endpoints.
    }
  }

  throw new Error(`No se encontró un endpoint válido para ${fileName}`);
};

export default function NewDestacado({ onCreated }) {
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
    const form = document.getElementById('crearFormDestacado');
    const formData = new FormData(form);

    if (!formData.get('imagen') || !formData.get('imagen').name) {
      toast.error('Debe seleccionar una imagen');
      return;
    }

    setMensaje('Subiendo imagen...');

    try {
      const { data } = await postFormDataWithFallback('destacadosPost.php', formData);

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
      setMensaje('');
      toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className='newDestacado'>
      <button onClick={toggleModal} className='newDestacado__trigger' type='button'>
        <FontAwesomeIcon icon={faPlus} />
        <span>Agregar destacado</span>
      </button>

      {modalOpen && (
        <div className='newDestacadoModalOverlay' onClick={toggleModal}>
          <div className='newDestacadoModal' onClick={(e) => e.stopPropagation()}>
            <div className='newDestacadoModal__header'>
              <div>
                <span className='newDestacadoModal__tag'>Nuevo destacado</span>
                <h3>Subir imagen destacada</h3>
                <p>Agrega una imagen para mostrarla en la sección destacada del catálogo.</p>
              </div>

              <button className='newDestacadoModal__close' onClick={toggleModal} type='button'>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form id='crearFormDestacado' className='newDestacadoForm'>
              <div className='uploadCard'>
                <div className='uploadCard__icon'>
                  <FontAwesomeIcon icon={faCloudArrowUp} />
                </div>

                <div className='uploadCard__text'>
                  <h4>Selecciona una imagen</h4>
                  <p>Formatos recomendados: JPG, PNG o WEBP.</p>
                </div>

                <label htmlFor='imagen' className='uploadCard__button'>
                  <FontAwesomeIcon icon={faUpload} />
                  Elegir archivo
                </label>

                <input
                  ref={fileInputRef}
                  type='file'
                  id='imagen'
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

              <div className='newDestacadoModal__footer'>
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
                    Subir destacado
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