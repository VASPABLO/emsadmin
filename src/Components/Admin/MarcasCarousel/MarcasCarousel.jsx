import React, { useEffect, useState } from 'react';
import SwiperCore, { Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './MarcasCarousel.css';
import baseURL from '../../url';

SwiperCore.use([Autoplay]);

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
      if (data?.error) {
        continue;
      }
      return { data, endpoint };
    } catch (error) {
      // Continue trying alternative endpoints.
    }
  }

  throw new Error(`No se encontró un endpoint válido para ${fileName}`);
};

export default function MarcasCarousel() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMarcas = async () => {
      try {
        const { data } = await fetchJsonFromCandidates('marcasGet.php', {
          method: 'GET',
        });
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
