import React, { useEffect, useState } from "react";
import "./Footer.css";
import logo from "../../images/logo.png";
import baseURL from "../url";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faArrowRight,
  faCamera,
  faUsers,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  const [productos, setProductos] = useState([]);
  const [contactos, setContactos] = useState({});

  useEffect(() => {
    cargarProductos();
    cargarContacto();
  }, []);

  const cargarProductos = () => {
    fetch(`${baseURL}/productosGet.php`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        setProductos((data?.productos || []).slice(0, 4));
      })
      .catch((e) => console.error("Error al cargar productos:", e));
  };

  const cargarContacto = () => {
    fetch(`${baseURL}/contactoGet.php`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        setContactos(data?.contacto?.slice().reverse()?.[0] || {});
      })
      .catch((e) => console.error("Error al cargar contactos:", e));
  };

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Col 1: Brand card */}
        <div className="footer__brandCard">
          <div className="footer__brandTop">
            <img src={logo} alt="EMS Soluciones" className="footer__logo" />
            <div className="footer__brandText">
              <span className="footer__brandTitle">EMS</span>
              <span className="footer__brandSub">Soluciones</span>
            </div>
          </div>

          <p className="footer__tagline">
            Soluciones confiables para compras, servicios y soporte.
          </p>

          <div className="footer__socials" aria-label="Redes sociales">
            {contactos?.instagram && (
              <a
                href={contactos.instagram}
                target="_blank"
                rel="noreferrer"
                className="footer__iconBtn"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faCamera} />
              </a>
            )}
            {contactos?.facebook && (
              <a
                href={contactos.facebook}
                target="_blank"
                rel="noreferrer"
                className="footer__iconBtn"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faUsers} />
              </a>
            )}
            {contactos?.telefono && (
              <a
                href={`https://wa.me/${String(contactos.telefono).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="footer__iconBtn"
                aria-label="WhatsApp"
              >
                <FontAwesomeIcon icon={faCommentDots} />
              </a>
            )}
          </div>
        </div>

        {/* Col 2: Ventas */}
        <div className="footer__col">
         <h2>{contactos?.departamento || 'Departamento de Ventas'}</h2>

          <div className="footer__ctaBox">
            {contactos?.telefono && (
              <a
                className="footer__cta"
                href={`tel:${contactos.telefono}`}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>Llamar ahora</span>
                <FontAwesomeIcon icon={faArrowRight} className="footer__ctaArrow" />
              </a>
            )}
            {contactos?.email && (
              <a
                className="footer__cta"
                href={`mailto:${contactos.email}`}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Escribir correo</span>
                <FontAwesomeIcon icon={faArrowRight} className="footer__ctaArrow" />
              </a>
            )}
          </div>
        </div>

        {/* Col 3: Contacto */}
        <div className="footer__col">
          <h3 className="footer__title">Contacto</h3>

          <ul className="footer__list">
            {contactos?.email && (
              <li>
                <a
                  className="footer__link"
                  href={`mailto:${contactos.email}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{contactos.email}</span>
                </a>
              </li>
            )}

            {contactos?.telefono && (
              <li>
                <a
                  className="footer__link"
                  href={`tel:${contactos.telefono}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{contactos.telefono}</span>
                </a>
              </li>
            )}

            {contactos?.direccion && (
              <li>
                <a
                  className="footer__link"
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    contactos.direccion
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span className="footer__clamp2">{contactos.direccion}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Col 4: Productos */}
        <div className="footer__col">
          <h3 className="footer__title">Productos</h3>

          <ul className="footer__list">
            {productos?.map((item) => (
              <li key={item?.id || item?.codigo || item?.titulo}>
                {/* Si tenés ruta interna real, ponela aquí: `/producto/${item.id}` */}
                <Link className="footer__link footer__link--internal" to={"/"}>
                  <span className="footer__dot" />
                  <span className="footer__clamp1">{item?.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottomInner">
          <span className="footer__small">
            © {year} EMS Soluciones. Todos los derechos reservados.
          </span>

          <div className="footer__bottomLinks">
            <Link to="/terminos" className="footer__smallLink">
              Términos
            </Link>
            <Link to="/privacidad" className="footer__smallLink">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}