import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Contacto.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faArrowRight, faClock, faHeadset } from '@fortawesome/free-solid-svg-icons';
import baseURL from '../../Components/url';

export default function ContactoWhatsapp() {
  const [phoneText, setPhoneText] = useState('6070-5566');

  useEffect(() => {
    fetch(`${baseURL}/contactoGet.php`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        const contactos = data?.contacto || [];
        if (contactos.length === 0) {
          return;
        }

        // Use the latest contact entry when multiple records exist.
        const latest = [...contactos].sort((a, b) => Number(b.idContacto) - Number(a.idContacto))[0];
        if (latest?.telefono) {
          setPhoneText(String(latest.telefono));
        }
      })
      .catch((error) => {
        console.error('Error al cargar el telefono de contacto:', error);
      });
  }, []);

  const phone = useMemo(() => {
    const digits = String(phoneText || '').replace(/\D/g, '');
    if (!digits) {
      return '50660705566';
    }

    // If only local CR number is provided, prepend country code for wa.me.
    return digits.length === 8 ? `506${digits}` : digits;
  }, [phoneText]);

  const message = encodeURIComponent('Hola, deseo recibir información sobre sus productos y servicios.');
  const whatsappLink = `https://wa.me/${phone}?text=${message}`;

  return (
    <section className="contact-whatsapp-page">
      <div className="contact-whatsapp-bg"></div>

      <div className="contact-whatsapp-container">
        <Link to="/home" className="contact-whatsapp-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Volver</span>
        </Link>

        <div className="contact-whatsapp-card">
          <div className="contact-whatsapp-badge">
            <FontAwesomeIcon icon={faWhatsapp} />
            <span>Atención directa por WhatsApp</span>
          </div>

          <h1 className="contact-whatsapp-title">
            Estamos listos para atenderte
          </h1>

          <p className="contact-whatsapp-description">
            Para consultas, cotizaciones o información sobre nuestros productos,
            contáctanos directamente por WhatsApp. Te brindaremos atención rápida
            y personalizada.
          </p>

          <div className="contact-whatsapp-number-box">
            <span className="contact-whatsapp-number-label">Número de contacto</span>
            <span className="contact-whatsapp-number">{phoneText}</span>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="contact-whatsapp-button"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            <span>Escribir por WhatsApp</span>
            <FontAwesomeIcon icon={faArrowRight} className="contact-whatsapp-arrow" />
          </a>

          <div className="contact-whatsapp-info">
            <div className="contact-whatsapp-info-item">
              <FontAwesomeIcon icon={faHeadset} />
              <span>Atención personalizada</span>
            </div>

            <div className="contact-whatsapp-info-item">
              <FontAwesomeIcon icon={faClock} />
              <span>Respuesta ágil y directa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}