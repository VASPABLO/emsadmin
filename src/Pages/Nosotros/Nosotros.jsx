
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faEye,
  faAward,
  faUsers,
  faArrowRight,
  faHandshake,
} from '@fortawesome/free-solid-svg-icons';
import somosImg from '../../images/somos.png';
import './Nosotros.css';
import '../PublicTheme.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';

const valores = [
  {
    title: 'Calidad',
    description:
      'Nos comprometemos a ofrecer productos y servicios de la más alta calidad, cumpliendo con estándares exigentes.',
  },
  {
    title: 'Integridad',
    description:
      'Actuamos con honestidad, transparencia y ética en todas nuestras relaciones y operaciones.',
  },
  {
    title: 'Innovación',
    description:
      'Buscamos constantemente nuevas soluciones y tecnologías que aporten valor real a nuestros clientes.',
  },
  {
    title: 'Compromiso',
    description:
      'Estamos dedicados al éxito de nuestros clientes con soporte continuo y soluciones personalizadas.',
  },
  {
    title: 'Excelencia',
    description:
      'Nos esforzamos por superar expectativas en cada proyecto, entregando resultados sólidos.',
  },
  {
    title: 'Responsabilidad',
    description:
      'Asumimos con seriedad nuestro impacto en la sociedad y el medio ambiente, promoviendo prácticas sostenibles.',
  },
];

export default function Nosotros() {
  useEffect(() => {
    document.title = 'Sobre Nosotros - EMS Soluciones Industriales';
  }, []);

  return (
    <>
      <Navbar />
      <main className='nosotros-page public-theme'>
      <section className='nosotros-hero'>
        <div className='public-container nosotros-hero-grid'>
        <div className='nosotros-hero-content reveal'>
          <p className='public-kicker'>Soluciones Industriales de Confianza</p>
          <h1>Quiénes Somos</h1>
          <p>
            Líderes en soluciones industriales con compromiso hacia la excelencia,
            el respaldo técnico y la atención personalizada.
          </p>

          <div className='nosotros-hero-actions'>
            <Link to='/servicios' className='public-btn public-btn--light'>
              Ver servicios <FontAwesomeIcon icon={faArrowRight} />
            </Link>
            <Link to='/contacto' className='public-btn public-btn--ghost'>
              <FontAwesomeIcon icon={faHandshake} /> Hablemos
            </Link>
          </div>
        </div>

        <div className='nosotros-hero-image reveal reveal-delay-2'>
          <img src={somosImg} alt='Equipo de EMS Soluciones Industriales' />
        </div>
        </div>
      </section>

      <section className='nosotros-company public-container'>
        <div className='nosotros-history reveal'>
          <h2>Nuestra Historia</h2>
          <p>
            En EMS Soluciones Industriales nos enorgullece ser una empresa costarricense
            conformada por dos familias unidas por la pasión, la experiencia y el
            compromiso con la industria nacional.
          </p>
          <p>
            Nos especializamos en ofrecer soluciones integrales que optimizan los procesos
            productivos de nuestros clientes, brindando confianza, respaldo técnico y atención
            personalizada.
          </p>
          <p>
            Nuestro equipo combina conocimiento, responsabilidad y servicio de calidad, buscando
            ser más que un proveedor: un aliado estratégico en el crecimiento de la industria
            costarricense.
          </p>
        </div>

        <div className='nosotros-metrics reveal reveal-delay-1'>
          <article className='metric metric-primary'>
            <FontAwesomeIcon icon={faUsers} />
            <strong>100+</strong>
            <span>Clientes Satisfechos</span>
          </article>
          <article className='metric'>
            <FontAwesomeIcon icon={faAward} />
            <strong>4+</strong>
            <span>Años de Experiencia</span>
          </article>
          <article className='metric'>
            <FontAwesomeIcon icon={faBullseye} />
            <strong>100+</strong>
            <span>Proyectos</span>
          </article>
          <article className='metric metric-primary'>
            <FontAwesomeIcon icon={faEye} />
            <strong>100%</strong>
            <span>Compromiso</span>
          </article>
        </div>
      </section>

      <section className='nosotros-goal'>
        <div className='public-container'>
        <h2>
          Nuestra meta es ofrecer, además de un producto,
          una solución a las necesidades industriales de cada cliente.
        </h2>
        </div>
      </section>

      <section className='nosotros-values public-container'>
        <div className='nosotros-values-header'>
          <h2>Nuestros Valores</h2>
          <p>Principios que guían nuestro trabajo diario.</p>
        </div>

        <div className='nosotros-values-grid'>
          {valores.map((value, index) => (
            <article key={value.title} className={`value-card reveal reveal-delay-${(index % 3) + 1}`}>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
