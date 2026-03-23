import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Link as Anchor, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faHome,
  faBoxOpen,
  faShoppingCart,
  faPhoneAlt,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import logo from '../../images/logo.png';
import baseURL from '../url';

import Profile from '../Profile/Profile';
import Favoritos from '../Favoritos/Favoritos';
import InputSerach from '../InputSerach/InputSearchs';
import Cart from '../Cart/Cart';

import './Navbar.css';

Modal.setAppElement('#root');

const getCartBadgeCountFromStorage = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!Array.isArray(parsed)) {
      return 0;
    }
    return parsed.reduce((total, item) => total + (Number(item?.cantidad) || 0), 0);
  } catch (error) {
    return 0;
  }
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBadgeCount, setCartBadgeCount] = useState(() => getCartBadgeCountFromStorage());

  const location = useLocation();

  useEffect(() => {
    cargarBanners();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncCartBadge = () => {
      setCartBadgeCount(getCartBadgeCountFromStorage());
    };

    const handleStorage = (event) => {
      if (event.key && event.key !== 'cart') {
        return;
      }
      syncCartBadge();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncCartBadge();
      }
    };

    syncCartBadge();
    window.addEventListener('cart-updated', syncCartBadge);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncCartBadge);
    window.addEventListener('pageshow', syncCartBadge);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('cart-updated', syncCartBadge);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncCartBadge);
      window.removeEventListener('pageshow', syncCartBadge);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    setCartBadgeCount(getCartBadgeCountFromStorage());
  }, [location.pathname]);

  const cargarBanners = () => {
    fetch(`${baseURL}/bannersGet.php`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        const bannerImages = (data?.banner || []).map((b) => b.imagen);
        setImages(bannerImages);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar banners:', error);
        setLoading(false);
      });
  };

  const openCartFromBottomNav = () => {
    const cartButton = document.querySelector('.cartIconFixed');
    if (cartButton) {
      cartButton.click();
    } else {
      setIsCartOpen(true);
    }
    setIsOpen(false);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <nav className="navbar">
          <Anchor to="/home" className="navbar__brand">
            <div className="navbar__brand-mark">
              <img src={logo} alt="EMS Soluciones" />
            </div>

            <div className="navbar__brand-text">
              <span className="navbar__brand-title">EMS</span>
              <span className="navbar__brand-subtitle">Soluciones</span>
            </div>
          </Anchor>

          <div className="navbar__center">
            <NavLink to="/home" end className="navbar__link">
              Inicio
            </NavLink>
            <NavLink to="/nosotros" className="navbar__link">
              Sobre Nosotros
            </NavLink>
            <NavLink to="/servicios" className="navbar__link">
              Servicios
            </NavLink>
            <NavLink to="/catalogo" className="navbar__link">
              Catálogo
            </NavLink>
            <NavLink to="/contacto" className="navbar__link">
              Contacto
            </NavLink>
          </div>

          <div className="navbar__right">
            <div className="navbar__desktop-tools">
              <Favoritos />
              <InputSerach />
            </div>

            <button
              className={`navbar__toggle ${isOpen ? 'navbar__toggle--active' : ''}`}
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Abrir menú"
              type="button"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
            </button>
          </div>
        </nav>
      </header>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="mobile-drawer"
        overlayClassName="mobile-drawer__overlay"
      >
        <div className="mobile-drawer__top">
          <button
            type="button"
            className="mobile-drawer__close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="mobile-drawer__body">
          <div className="mobile-drawer__nav">
            <Anchor to="/home" className="mobile-drawer__link" onClick={() => setIsOpen(false)}>
              <span>Inicio</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </Anchor>

            <Anchor to="/nosotros" className="mobile-drawer__link" onClick={() => setIsOpen(false)}>
              <span>Sobre Nosotros</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </Anchor>

            <Anchor to="/servicios" className="mobile-drawer__link" onClick={() => setIsOpen(false)}>
              <span>Servicios</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </Anchor>

            <Anchor to="/catalogo" className="mobile-drawer__link" onClick={() => setIsOpen(false)}>
              <span>Catálogo</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </Anchor>

            <Anchor to="/contacto" className="mobile-drawer__link" onClick={() => setIsOpen(false)}>
              <span>Contacto</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </Anchor>

            <button
              type="button"
              className="mobile-drawer__link mobile-drawer__link--button"
              onClick={openCartFromBottomNav}
            >
              <span className="mobile-drawer__label">
                Carrito
                {cartBadgeCount > 0 && <span className="cart-badge">{cartBadgeCount}</span>}
              </span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className="mobile-drawer__extras">
            <Profile hideIdentity />
          </div>
        </div>
      </Modal>

      <nav
        className={`bottom-menu ${isOpen ? 'bottom-menu--hidden' : ''}`}
        aria-label="Navegación móvil"
      >
        <NavLink
          to="/home"
          end
          className={({ isActive }) => `bottom-menu-link ${isActive ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Inicio</span>
        </NavLink>

        <NavLink
          to="/catalogo"
          className={({ isActive }) => `bottom-menu-link ${isActive ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faBoxOpen} />
          <span>Productos</span>
        </NavLink>

        <button
          type="button"
          className="bottom-menu-link bottom-menu-btn"
          onClick={openCartFromBottomNav}
        >
          <span className="bottom-menu-icon-wrap">
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartBadgeCount > 0 && <span className="cart-badge">{cartBadgeCount}</span>}
          </span>
          <span>Carrito</span>
        </button>
      </nav>

      <div className="bottom-menu-spacer" />

      {isCartOpen && (
        <Cart isOpen={isCartOpen} onRequestClose={() => setIsCartOpen(false)} hideTrigger />
      )}
    </>
  );
}