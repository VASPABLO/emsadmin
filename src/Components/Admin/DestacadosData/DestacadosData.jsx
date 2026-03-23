import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faImages,
  faSync,
  faStar,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import baseURL from '../../url';
import './DestacadosData.css';
import NewDestacado from '../NewDestacado/NewDestacado';

const buildEndpointCandidates = (fileName) => [
  new URL(fileName, `${baseURL}/`).toString(),
  new URL(`public/${fileName}`, `${baseURL}/`).toString(),
  new URL(`build/${fileName}`, `${baseURL}/`).toString(),
];

const fetchJsonFromCandidates = async (fileName, options = {}) => {
  for (const endpoint of buildEndpointCandidates(fileName)) {
    try {
      const response = await fetch(endpoint, options);
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

export default function DestacadosData() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDestacados();
  }, []);

  const cargarDestacados = async () => {
    setLoading(true);
    try {
      const { data } = await fetchJsonFromCandidates('destacadosGet.php', {
        method: 'GET',
      });
      setDestacados(data.destacados || []);
    } catch (error) {
      console.error('Error al cargar destacados:', error);
      toast.error('No se pudo cargar la lista de destacados');
    } finally {
      setLoading(false);
    }
  };

  const eliminarDestacado = (idDestacado) => {
    Swal.fire({
      title: '¿Eliminar destacado?',
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
        fetchJsonFromCandidates(`destacadoDelete.php?idDestacado=${idDestacado}`, {
          method: 'DELETE',
        })
          .then(({ data }) => {
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

            cargarDestacados();
          })
          .catch(error => {
            toast.error(error.message);
          });
      }
    });
  };

  const totalDestacados = useMemo(() => destacados.length, [destacados]);

  return (
    <section className='destacadosAdmin'>
      <ToastContainer />
      <NewDestacado onCreated={cargarDestacados} />

      <div className='destacadosAdmin__header'>
        <div>
          <span className='destacadosAdmin__badge'>
            <FontAwesomeIcon icon={faStar} />
            Gestión visual
          </span>
          <h1>Destacados</h1>
          <p>Administra las imágenes destacadas que se muestran en el catálogo.</p>
        </div>

        <div className='destacadosAdmin__actions'>
          <button className='adminActionBtn adminActionBtn--ghost' onClick={cargarDestacados}>
            <FontAwesomeIcon icon={faSync} />
            Recargar
          </button>
        </div>
      </div>

      <div className='destacadosAdmin__topbar'>
        <div className='statCard'>
          <span>Total destacados</span>
          <strong>{totalDestacados}</strong>
        </div>

        <div className='statCard'>
          <span>Estado</span>
          <strong>{loading ? 'Cargando...' : 'Actualizado'}</strong>
        </div>
      </div>

      {loading ? (
        <div className='destacadosStateCard'>
          <FontAwesomeIcon icon={faImages} />
          <h3>Cargando destacados...</h3>
          <p>Espera un momento mientras obtenemos la información.</p>
        </div>
      ) : destacados.length === 0 ? (
        <div className='destacadosStateCard'>
          <FontAwesomeIcon icon={faImage} />
          <h3>No hay destacados registrados</h3>
          <p>Agrega una imagen destacada para mostrarla en el catálogo.</p>
        </div>
      ) : (
        <div className='DestacadosWrap'>
          {destacados.map((item, index) => (
            <article className='cardDestacado' key={item.idDestacado}>
              <div className='cardDestacado__imageWrap'>
                {item.imagen ? (
                  <img src={item.imagen} alt={`Destacado ${index + 1}`} />
                ) : (
                  <div className='cardDestacado__placeholder'>Sin imagen</div>
                )}

                <div className='cardDestacado__overlay'>
                  <span className='cardDestacado__tag'>Destacado #{index + 1}</span>

                  <button
                    className='btnDestacadoDelete'
                    onClick={() => eliminarDestacado(item.idDestacado)}
                    title='Eliminar destacado'
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              <div className='cardDestacadoText'>
                <h4>Imagen destacada</h4>
                <p>ID #{item.idDestacado}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}