import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link as Anchor, useNavigate, useLocation } from "react-router-dom";
import './Detail.css';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faShoppingCart,
    faExternalLinkAlt,
    faStar,
    faHeart,
    faCheck,
    faPlus,
    faMinus
} from '@fortawesome/free-solid-svg-icons';
import whatsappIcon from '../../images/wpp.png';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import baseURL from '../url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DetailLoading from "../DetailLoading/DetailLoading";

SwiperCore.use([Navigation, Pagination, Autoplay]);

export default function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const swiperRef = useRef(null);
    const { idProducto } = useParams();

    const [producto, setProducto] = useState(null);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [contactos, setContactos] = useState({});
    const [favoritos, setFavoritos] = useState([]);
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");

    useEffect(() => {
        cargarDatos();
        cargarFavoritos();
    }, []);

    useEffect(() => {
        const product = productos.find((e) => e.idProducto === parseInt(idProducto));
        setProducto(product || null);
        setSelectedItemIndex(0);
    }, [idProducto, productos]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [idProducto]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            const [productosRes, contactoRes, categoriasRes] = await Promise.all([
                fetch(`${baseURL}/productosGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/contactoGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' })
            ]);

            const [productosData, contactoData, categoriasData] = await Promise.all([
                productosRes.json(),
                contactoRes.json(),
                categoriasRes.json()
            ]);

            setProductos(productosData.productos || []);
            setContactos(contactoData?.contacto?.slice().reverse()[0] || {});
            setCategorias(categoriasData.categorias || []);
        } catch (error) {
            console.error('Error al cargar detalle:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarFavoritos = () => {
        const storedFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        setFavoritos(storedFavoritos);
    };

    const imagenesProducto = useMemo(() => {
        if (!producto) return [];
        return [producto.imagen1, producto.imagen2, producto.imagen3, producto.imagen4].filter(Boolean);
    }, [producto]);

    const items = useMemo(() => {
        if (!producto) return [];
        return [
            producto.item1,
            producto.item2,
            producto.item3,
            producto.item4,
            producto.item5,
            producto.item6,
            producto.item7,
            producto.item8,
            producto.item9,
            producto.item10
        ].filter(Boolean);
    }, [producto]);

    const categoriaActual = useMemo(() => {
        if (!producto) return null;
        return categorias.find((cat) => cat.idCategoria === producto.idCategoria) || null;
    }, [categorias, producto]);

    const itemSeleccionado = items[selectedItemIndex] || '';

    const handleSelectionChange = (index) => {
        setSelectedItemIndex(index);
    };

    const handleCompartirClick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: producto?.titulo || document.title,
                    text: `Echa un vistazo a este producto: ${producto?.titulo || ''}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error al compartir:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Enlace copiado', { autoClose: 1200 });
        }
    };

    const handleWhatsappMessage = () => {
        const phoneNumber = contactos?.telefono || '';
        if (!phoneNumber) {
            toast.error('No hay número de contacto disponible', { autoClose: 1200 });
            return;
        }

        const nombreProducto = producto?.titulo || 'Producto';
        const detalleItem = itemSeleccionado ? `\n📌 Variante: ${itemSeleccionado}` : '';
        const detalleCantidad = `\n📦 Cantidad: ${cantidad}`;

        const message = `Hola, quisiera más información sobre:%0A%0A✅ *${nombreProducto}*${detalleItem}${detalleCantidad}`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

        window.open(whatsappUrl, '_blank');
    };

    const goBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const addToCart = (selectedItem) => {
        if (!producto) return;

        const parsedCart = JSON.parse(localStorage.getItem('cart')) || [];
        const cart = Array.isArray(parsedCart) ? parsedCart : [];

        const existingItemIndex = cart.findIndex((item) => String(item?.idProducto) === String(producto?.idProducto));

        if (existingItemIndex !== -1) {
            const existingItem = cart[existingItemIndex];
            const existingVariants = Array.isArray(existingItem?.item) ? existingItem.item : [];
            const updatedItems = selectedItem
                ? [...existingVariants, selectedItem]
                : [...existingVariants];

            cart[existingItemIndex] = {
                ...existingItem,
                item: updatedItems,
                cantidad: (Number(existingItem?.cantidad) || 0) + cantidad
            };
        } else {
            cart.push({
                idProducto: producto.idProducto,
                item: selectedItem ? [selectedItem] : [],
                cantidad
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Producto agregado al carrito', { autoClose: 1000 });
    };

    const incrementCantidad = () => {
        setCantidad((prev) => prev + 1);
    };

    const decrementCantidad = () => {
        setCantidad((prev) => (prev > 1 ? prev - 1 : 1));
    };

    const agregarAFavoritos = (idProducto) => {
        const favList = [...favoritos];
        const index = favList.indexOf(idProducto);

        if (index === -1) {
            favList.push(idProducto);
            setFavoritos(favList);
            localStorage.setItem('favoritos', JSON.stringify(favList));
            toast.success('Agregado a favoritos', { autoClose: 900 });
        } else {
            favList.splice(index, 1);
            setFavoritos(favList);
            localStorage.setItem('favoritos', JSON.stringify(favList));
            toast.info('Eliminado de favoritos', { autoClose: 900 });
        }
    };

    if (loading || !producto) {
        return <DetailLoading />;
    }

    return (
        <div className="detail">
            <ToastContainer />

            <div className="detailTopBar">
                <button type="button" className="backBtn" onClick={goBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Volver
                </button>

                <div className="detailTopActions">
                    <button
                        type="button"
                        onClick={() => agregarAFavoritos(producto.idProducto)}
                        className={`iconActionBtn favoriteBtn ${favoritos.includes(producto.idProducto) ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faHeart} />
                    </button>

                    <button
                        type="button"
                        className="iconActionBtn shareBtn"
                        onClick={handleCompartirClick}
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </button>
                </div>
            </div>

            <div className="detailHeroCard">
                <div className="detail-contain">
                    <div className="galleryPanel">
                        <div className="mainGallery">
                            <Swiper
                                grabCursor={true}
                                loop={imagenesProducto.length > 1}
                                slidesPerView={1}
                                navigation={true}
                                autoplay={imagenesProducto.length > 1 ? { delay: 3500, disableOnInteraction: false } : false}
                                pagination={{ clickable: true }}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                }}
                                className="detailSwiper"
                            >
                                {imagenesProducto.map((img, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="mainImageCard">
                                            <img
                                                src={img}
                                                alt={`${producto.titulo} ${index + 1}`}
                                                onClick={() => {
                                                    setModalImage(img);
                                                    setIsModalOpen(true);
                                                }}
                                                loading="lazy"
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {imagenesProducto.length > 1 && (
                            <div className="thumbsGrid">
                                {imagenesProducto.map((img, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className="thumbBtn"
                                        onClick={() => swiperRef.current?.slideToLoop(index)}
                                    >
                                        <img src={img} alt={`${producto.titulo} miniatura ${index + 1}`} loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="textDetail">
                        <div className="detailHeaderText">
                            {categoriaActual && (
                                <div className="categoryPill">
                                    <FontAwesomeIcon icon={faStar} />
                                    <span>{categoriaActual.categoria}</span>
                                </div>
                            )}

                            <h1 className="title">{producto.titulo}</h1>

                            <p className="detailDescription">{producto.descripcion}</p>
                        </div>

                        {items.length > 0 && (
                            <div className="detailBlock">
                                <h3 className="blockTitle">Opciones disponibles</h3>

                                <div className="itemsDetail modernItemsDetail">
                                    {items.map((item, index) => (
                                        <label
                                            key={index}
                                            className={`itemChip ${selectedItemIndex === index ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="opcionProducto"
                                                value={item}
                                                checked={selectedItemIndex === index}
                                                onChange={() => handleSelectionChange(index)}
                                            />
                                            <span>{item}</span>
                                            {selectedItemIndex === index && (
                                                <FontAwesomeIcon icon={faCheck} className="itemChipIcon" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="detailBlock">
                            <h3 className="blockTitle">Cantidad</h3>

                            <div className="quantityBox">
                                <button type="button" onClick={decrementCantidad} className="qtyBtn">
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>

                                <span className="qtyValue">{cantidad}</span>

                                <button type="button" onClick={incrementCantidad} className="qtyBtn">
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                        </div>

                        <div className="deFlexGoTocart modernActions">
                            <button
                                type="button"
                                onClick={() => addToCart(itemSeleccionado)}
                                className="btnAdd"
                            >
                                <FontAwesomeIcon icon={faShoppingCart} />
                                Agregar al carrito
                            </button>

                            <button type="button" className="wpp" onClick={handleWhatsappMessage}>
                                Consultar por WhatsApp
                                <img src={whatsappIcon} alt="WhatsApp" />
                            </button>
                        </div>

                        <div className="detailMiniInfo">
                            <div className="miniInfoCard">
                                <strong>Atención personalizada</strong>
                                <span>Consulta disponibilidad y detalles directamente por WhatsApp.</span>
                            </div>

                            <div className="miniInfoCard">
                                <strong>Producto destacado</strong>
                                <span>Diseño visual mejorado para una experiencia más clara y moderna.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                center
                classNames={{ modal: 'custom-modal' }}
            >
                <img src={modalImage} alt={producto.titulo} />
            </Modal>
        </div>
    );
}