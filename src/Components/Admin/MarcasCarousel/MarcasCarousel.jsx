import React, { useEffect, useState } from 'react';
import SwiperCore, { Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './MarcasCarousel.css';
import baseURL from '../../url';

SwiperCore.use([Autoplay]);

export default function MarcasCarousel() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMarcas = async () => {
      try {
        const response = await fetch(`${baseURL}/marcas/marcasGet.php`, {
          method: 'GET',
        });
        const data = await response.json();
        setMarcas(data.marcas || []);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        setMarcas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarMarcas();
  }, []);

  if (loading) {
    return <div className='marcasCarouselState'>Cargando marcas...</div>;
  }

  if (marcas.length === 0) {
    return <div className='marcasCarouselState'>No hay marcas registradas.</div>;
  }

  return (
    <div className='marcasCarousel'>
      <Swiper
        slidesPerView={'auto'}
        spaceBetween={18}
        loop={marcas.length > 3}
        speed={5000}
        allowTouchMove={false}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {marcas.map((marca) => (
          <SwiperSlide key={marca.idMarca} className='marcasCarousel__slide'>
            <div className='marcasCarousel__card'>
              {marca.imagen ? (
                <img src={marca.imagen} alt={`Marca ${marca.idMarca}`} />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
