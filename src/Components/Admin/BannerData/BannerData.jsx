import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faSync,
    faImages,
    faImage,
    faClapperboard,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import baseURL from '../../url';
import './BannerData.css';
import NewBanner from '../NewBanner/NewBanner';

export default function BannerData() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarBanners();
    }, []);

    const cargarBanners = () => {
        setLoading(true);
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setBanners(data.banner || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar banners:', error);
                setLoading(false);
            });
    };

    const eliminarBanner = (idBanner) => {
        Swal.fire({
            title: '¿Eliminar banner?',
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
                fetch(`${baseURL}/bannerDelete.php?idBanner=${idBanner}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
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

                        cargarBanners();
                    })
                    .catch(error => {
                        console.error('Error al eliminar banner:', error);
                        toast.error(error.message);
                    });
            }
        });
    };

    const totalBanners = useMemo(() => banners.length, [banners]);

    return (
        <section className='bannersAdmin'>
            <ToastContainer />
            <NewBanner onCreated={cargarBanners} />

            <div className='bannersAdmin__header'>
                <div>
                    <span className='bannersAdmin__badge'>
                        <FontAwesomeIcon icon={faClapperboard} />
                        Gestión visual
                    </span>
                    <h1>Banners</h1>
                    <p>Administra los banners principales que se muestran en el sitio.</p>
                </div>

                <div className='bannersAdmin__actions'>
                    <button className='adminActionBtn adminActionBtn--ghost' onClick={cargarBanners}>
                        <FontAwesomeIcon icon={faSync} />
                        Recargar
                    </button>
                </div>
            </div>

            <div className='bannersAdmin__topbar'>
                <div className='statCard'>
                    <span>Total banners</span>
                    <strong>{totalBanners}</strong>
                </div>

                <div className='statCard'>
                    <span>Estado</span>
                    <strong>{loading ? 'Cargando...' : 'Actualizado'}</strong>
                </div>
            </div>

            {loading ? (
                <div className='bannersStateCard'>
                    <FontAwesomeIcon icon={faImages} />
                    <h3>Cargando banners...</h3>
                    <p>Espera un momento mientras obtenemos la información.</p>
                </div>
            ) : banners.length === 0 ? (
                <div className='bannersStateCard'>
                    <FontAwesomeIcon icon={faImage} />
                    <h3>No hay banners registrados</h3>
                    <p>Agrega un banner para destacarlo en la portada.</p>
                </div>
            ) : (
                <div className='BannersWrap'>
                    {banners.map((item, index) => (
                        <article className='cardBanner' key={item.idBanner}>
                            <div className='cardBanner__imageWrap'>
                                {item.imagen ? (
                                    <img src={item.imagen} alt={`Banner ${index + 1}`} />
                                ) : (
                                    <div className='cardBanner__placeholder'>Sin imagen</div>
                                )}

                                <div className='cardBanner__overlay'>
                                    <span className='cardBanner__tag'>Banner #{index + 1}</span>

                                    <button
                                        className='btnBannerDelete'
                                        onClick={() => eliminarBanner(item.idBanner)}
                                        title='Eliminar banner'
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>

                            <div className='cardBannerText'>
                                <h4>Imagen de banner</h4>
                                <p>ID #{item.idBanner}</p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
