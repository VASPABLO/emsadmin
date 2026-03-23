
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheck, faArrowRight, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import mantenimientoImg from '../../images/mantenimiento.png';
import capacitacionesImg from '../../images/capacitaciones.png';
import arquitecturaImg from '../../images/arquitectura.png';
import './Servicios.css';
import '../PublicTheme.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';

const servicios = [
  {
    title: 'MANTENIMIENTO',
    description:
      'Realizamos mantenimiento de equipos hidráulicos y compresoras con profesionales certificados. Contamos con servicio de emergencias disponible 24/7.',
    image: mantenimientoImg,
    imageAlt: 'Mantenimiento de equipos hidráulicos',
    details: ['ventas@ems-soluciones.com'],
  },
  {
    title: 'CAPACITACIONES',
    description:
      'Brindamos asesoría y acompañamiento a nuestros clientes en el mantenimiento, instalación y uso correcto de maquinaria, herramientas industriales, fajas industriales y técnicas de sellado.',
    image: capacitacionesImg,
    imageAlt: 'Capacitación técnica industrial',
    details: ['Material técnico incluido', 'Acompañamiento personalizado'],
  },
  {
    title: 'ARQUITECTURA',
    description:
      'Trabajamos para satisfacer los deseos de nuestros clientes con compromiso y transparencia, ofreciendo soluciones personalizadas que se adapten a las necesidades específicas de la industria.',
    image: arquitecturaImg,
    imageAlt: 'Planos y arquitectura industrial',
    details: [],
  },
];

export default function Servicios() {
  useEffect(() => {
    document.title = 'Servicios - EMS Soluciones Industriales';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Conoce nuestros servicios de mantenimiento, capacitaciones y arquitectura industrial.'
      );
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className='servicios-page public-theme'>
      <section className='servicios-hero'>
        <div className='public-container reveal'>
          <p className='public-kicker'>Especialistas en Campo</p>
          <h1>Nuestros Servicios</h1>
          <p>
            Soluciones tecnicas, soporte continuo y acompanamiento para elevar la productividad de tu operacion.
          </p>
          <div className='servicios-hero-actions'>
            <Link to='/contacto' className='public-btn public-btn--light'>
              Solicitar asesoria <FontAwesomeIcon icon={faArrowRight} />
            </Link>
            <Link to='/productos' className='public-btn public-btn--ghost'>
              Ver catalogo
            </Link>
          </div>
        </div>
      </section>

      <section className='servicios-wrapper public-container'>
        <div className='servicios-list'>
          {servicios.map((servicio, index) => {
            const isEven = index % 2 === 1;

            return (
              <article key={servicio.title} className={`servicio-item reveal reveal-delay-${(index % 3) + 1}`}>
                <div className='servicio-grid'>
                  <div className={`servicio-content ${isEven ? 'order-2' : 'order-1'}`}>
                    <h2>{servicio.title}</h2>
                    <p>{servicio.description}</p>

                    {servicio.details.length > 0 && (
                      <div className='servicio-details'>
                        <p className='servicio-label'>Incluye:</p>
                        <ul>
                          {servicio.details.map((detalle) => (
                            <li key={detalle}>
                              <FontAwesomeIcon
                                icon={servicio.title === 'MANTENIMIENTO' ? faEnvelope : faCheck}
                              />
                              <span>{detalle}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link to='/contacto' className='public-btn public-btn--outline servicio-cta'>
                      <FontAwesomeIcon icon={faCircleInfo} /> Quiero mas informacion
                    </Link>
                  </div>

                  <div className={`servicio-image ${isEven ? 'order-1' : 'order-2'}`}>
                    <img src={servicio.image} alt={servicio.imageAlt} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
