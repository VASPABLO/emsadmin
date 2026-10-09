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
import apiFetch from '../../apiFetch';
import './MarcasData.css';
import NewMarca from '../NewMarca/NewMarca';

export default function MarcasData() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`${baseURL}/marcas/marcasGet.php`, {
        method: 'GET',
      });
      const data = await response.json();
      setMarcas(data.marcas || []);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
      toast.error('No se pudo cargar la lista de marcas');
    } finally {
      setLoading(false);
    }
  };

  const eliminarMarca = (idMarca) => {
    Swal.fire({
      title: '¿Eliminar marca?',
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
        apiFetch(`${baseURL}/marcas/marcaDelete.php?idMarca=${idMarca}`, {
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

            cargarMarcas();
          })
          .catch(error => {
            toast.error(error.message);
          });
      }
    });
  };

  const totalMarcas = useMemo(() => marcas.length, [marcas]);

  return (
    <section className='marcasAdmin'>
      <ToastContainer />
      <NewMarca onCreated={cargarMarcas} />

      <div className='marcasAdmin__header'>
        <div>
          <span className='marcasAdmin__badge'>
            <FontAwesomeIcon icon={faStar} />
            Gestión de marcas
          </span>
          <h1>Marcas Aliadas</h1>
          <p>Administra los logos de marcas que se muestran en el catálogo.</p>
        </div>

        <div className='marcasAdmin__actions'>
          <button className='adminActionBtn adminActionBtn--ghost' onClick={cargarMarcas}>
            <FontAwesomeIcon icon={faSync} />
            Recargar
          </button>
        </div>
      </div>

      <div className='marcasAdmin__topbar'>
        <div className='statCard'>
          <span>Total marcas</span>
          <strong>{totalMarcas}</strong>
        </div>

        <div className='statCard'>
          <span>Estado</span>
          <strong>{loading ? 'Cargando...' : 'Actualizado'}</strong>
        </div>
      </div>

      {loading ? (
        <div className='marcasStateCard'>
          <FontAwesomeIcon icon={faImages} />
          <h3>Cargando marcas...</h3>
          <p>Espera un momento mientras obtenemos la información.</p>
        </div>
      ) : marcas.length === 0 ? (
        <div className='marcasStateCard'>
          <FontAwesomeIcon icon={faImage} />
          <h3>No hay marcas registradas</h3>
          <p>Agrega el logo de una marca para mostrarlo en el catálogo.</p>
        </div>
      ) : (
        <div className='MarcasWrap'>
          {marcas.map((item, index) => (
            <article className='cardMarca' key={item.idMarca}>
              <div className='cardMarca__imageWrap'>
                {item.imagen ? (
                  <img src={item.imagen} alt={`Marca ${index + 1}`} />
                ) : (
                  <div className='cardMarca__placeholder'>Sin imagen</div>
                )}

                <div className='cardMarca__overlay'>
                  <span className='cardMarca__tag'>Marca #{index + 1}</span>

                  <button
                    className='btnMarcaDelete'
                    onClick={() => eliminarMarca(item.idMarca)}
                    title='Eliminar marca'
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              <div className='cardMarcaText'>
                <h4>Marca aliada</h4>
                <p>ID #{item.idMarca}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
