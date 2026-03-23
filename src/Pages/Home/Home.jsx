
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faWrench,
  faShieldAlt,
  faAward,
  faPhone,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import baseURL from '../../Components/url';
import logo from '../../images/inicio.png';
import brandLogo from '../../images/logo.png';
import './Home.css';
import '../PublicTheme.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestacado, setSelectedDestacado] = useState(null);

  useEffect(() => {
    document.title = 'EMS Soluciones Industriales - Productos y Servicios de Calidad';
    cargarDatos();

    const welcomeTimer = window.setTimeout(() => {
      setWelcomeReady(true);
    }, 6000);

    return () => window.clearTimeout(welcomeTimer);
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setModalOpen(false);
        setSelectedDestacado(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  const cargarDatos = async () => {
    try {
      const [resDestacados] = await Promise.all([
        fetch(`${baseURL}/destacadosGet.php`, { method: 'GET' }),
      ]);

      const dataDestacados = await resDestacados.json();

      setDestacados((dataDestacados?.destacados || []).slice(0, 3));
    } catch (error) {
      console.error('Error al cargar datos de Home:', error);
      setDestacados([]);
    } finally {
      setLoading(false);
    }
  };

  const openDestacadoModal = (destacado) => {
    setSelectedDestacado(destacado);
    setModalOpen(true);
  };

  const closeDestacadoModal = () => {
    setModalOpen(false);
    setSelectedDestacado(null);
  };

  if (!welcomeReady || loading) {
    return (
      <main className='home-preloader public-theme'>
        <div className='home-preloader__center' aria-label='Pantalla de bienvenida'>
          <div className='home-preloader__orbit'>
            <div className='home-preloader__ring' aria-hidden='true' />
            <div className='home-preloader__logoWrap'>
              <img src={brandLogo} alt='Logo EMS Soluciones' className='home-preloader__logo' />
            </div>
          </div>

          <h1>Bienvenidos a EMS Soluciones</h1>
          <div className='home-preloader__loadingRow'>
            <span className='home-preloader__spinner' aria-hidden='true' />
            <strong>Cargando...</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className='home-page public-theme'>
      <section className='home-hero'>
        <div className='public-container home-hero-grid'>
        <div className='home-hero-overlay reveal'>
          <span className='public-kicker'>Soluciones Industriales de Confianza</span>
          <h1>EMS Soluciones Industriales</h1>
          <p>
            Proveemos productos y servicios de alta calidad para optimizar los procesos de su empresa.
          </p>
          <div className='home-hero-actions'>
            <Link to='/productos' className='public-btn public-btn--light'>
              Ver Productos <FontAwesomeIcon icon={faArrowRight} />
            </Link>
            <Link to='/contacto' className='public-btn public-btn--ghost'>
              Contáctanos
            </Link>
          </div>

          <div className='home-mini-stats reveal reveal-delay-1'>
            <span><strong>4+</strong> años</span>
            <span><strong>100+</strong> proyectos</span>
            <span><strong>24/7</strong> soporte</span>
          </div>
        </div>

        <div className='home-hero-image reveal reveal-delay-2'>
          <img src={logo} alt='EMS Soluciones' />
        </div>
        </div>
      </section>

      <section className='home-services public-container'>
        <article className='home-card reveal'>
          <div className='home-icon'>
            <FontAwesomeIcon icon={faWrench} />
          </div>
          <h3>Servicios</h3>
          <p>En EMS Soluciones, ofrecemos una amplia gama de servicios industriales diseñados para satisfacer las necesidades específicas de cada cliente..</p>
        </article>
        <article className='home-card reveal reveal-delay-1'>
          <div className='home-icon'>
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          <h3>Experiencia</h3>
          <p>Con más de 4 años de experiencia en el sector industrial, EMS Soluciones ha consolidado su reputación como un líder en el suministro de soluciones eficientes y de alta calidad.</p>
        </article>

        <article className='home-card reveal reveal-delay-2'>
          <div className='home-icon'>
            <FontAwesomeIcon icon={faAward} />
          </div>
          <h3>Respaldo</h3>
          <p>La satisfacción de nuestros clientes es nuestra principal prioridad, y por eso en EMS Soluciones brindamos un respaldo constante en cada etapa del proyecto.</p>
        </article>

      </section>

      <section className="home-mision-vision public-container">
        <div className="home-card reveal">
          <h3>Misión</h3>
          <p>
            Proporcionar las herramientas adecuadas para la innovación. La empresa se enfoca en ofrecer productos y consumibles industriales que permitan que sus clientes desarrollen y mejoren sus procesos productivos, con atención cercana, calidad y servicio enfocados en sus necesidades.
          </p>
        </div>
        <div className="home-card reveal reveal-delay-1">
          <h3>Visión</h3>
          <p>
            Ayudar a nuestros clientes a alcanzar su máximo potencial. Esto implica ser un socio estrategico que no solo vende productos, sino que también impulsa el crecimiento y el éxito de las operaciones de sus clientes indistriales.
          </p>
        </div>
      </section>
           
      <section className='home-featured public-container'>
        <div className='home-featured-header'>
          <h2>Productos Destacados</h2>
          <p>Descubre algunos de nuestros productos más populares.</p>
        </div>

        {loading ? (
          <div className='home-loading'>Cargando productos...</div>
        ) : destacados.length === 0 ? (
          <div className='home-empty'>No hay productos disponibles</div>
        ) : (
          <div className='home-products-grid'>
            {destacados.map((destacado) => (
              <article
                key={destacado.idDestacado}
                className='home-product-card'
                role='button'
                tabIndex={0}
                onClick={() => openDestacadoModal(destacado)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDestacadoModal(destacado);
                  }
                }}
              >
                <div className='home-product-image'>
                  {destacado.imagen ? (
                    <img src={destacado.imagen} alt='destacado' />
                  ) : (
                    <span>Sin imagen</span>
                  )}
                </div>

                <div className='home-product-body'>
                  <span className='home-chip'><FontAwesomeIcon icon={faBoxOpen} /> Destacado</span>
                  <button type='button' className='home-featured-open-btn'>Ver producto</button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className='home-bottom-action'>
          <Link to='/productos' className='public-btn public-btn--primary'>
            Ver todos los productos <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>

      <section className='home-cta'>
        <div className='public-container home-cta-inner'>
        <h2>Listo para optimizar tus procesos industriales</h2>
        <p>Contáctanos hoy y descubre como podemos ayudarte a mejorar la eficiencia de tu empresa.</p>
        <div className='home-hero-actions'>
          <Link to='/contacto' className='public-btn public-btn--light'>
            <FontAwesomeIcon icon={faPhone} /> Solicitar cotizacion
          </Link>
          <Link to='/servicios' className='public-btn public-btn--ghost'>Conocer Servicios</Link>
        </div>
        </div>
      </section>

      {modalOpen && selectedDestacado && (
        <div className='home-featured-modal-overlay' onClick={closeDestacadoModal}>
          <div className='home-featured-modal' onClick={(event) => event.stopPropagation()}>
            <button type='button' className='home-featured-modal-close' onClick={closeDestacadoModal} aria-label='Cerrar modal'>
              X
            </button>

            <div className='home-featured-modal-media'>
              {selectedDestacado.imagen ? (
                <img src={selectedDestacado.imagen} alt={selectedDestacado.titulo || selectedDestacado.nombre || 'Producto destacado'} />
              ) : (
                <div className='home-featured-modal-empty'>Sin imagen disponible</div>
              )}
            </div>

            <div className='home-featured-modal-body'>
              <h3>{selectedDestacado.titulo || selectedDestacado.nombre || 'Producto destacado'}</h3>
              <p>{selectedDestacado.descripcion || 'Sin descripcion disponible para este producto.'}</p>

              {selectedDestacado.precio && (
                <strong>{selectedDestacado.precio}</strong>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
      <Footer />
    </>
  );
}
