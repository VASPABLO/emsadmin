import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import baseURL from '../url';
import './Products.css';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleRight,
    faAngleDoubleRight,
    faFireFlameCurved,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductosLoading from '../ProductosLoading/ProductosLoading';
import { Link as Anchor } from 'react-router-dom';

SwiperCore.use([Navigation, Pagination, Autoplay]);

export default function Products() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fixedCategories, setFixedCategories] = useState(false);
    const [productos, setProductos] = useState([]);
    const [destacados, setDestacados] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todo');

    const categoriasInputRef = useRef(null);

    const handleClickCategoria = useCallback((categoria) => {
        setCategoriaSeleccionada(categoria);
    }, []);

    const handleScroll = useCallback(() => {
        if (!categoriasInputRef.current) return;

        const shouldBeFixed = window.scrollY > categoriasInputRef.current.offsetTop + 30;

        setFixedCategories((prev) => {
            if (prev !== shouldBeFixed) return shouldBeFixed;
            return prev;
        });
    }, []);

    useEffect(() => {
        cargarDatos();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            const [productosRes, categoriasRes, destacadosRes] = await Promise.all([
                fetch(`${baseURL}/productosGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' }),
                fetch(`${baseURL}/destacadosGet.php`, { method: 'GET' })
            ]);

            const [productosData, categoriasData, destacadosData] = await Promise.all([
                productosRes.json(),
                categoriasRes.json(),
                destacadosRes.json()
            ]);

            setProductos(productosData.productos || []);
            setCategorias(categoriasData.categorias || []);
            setDestacados(destacadosData.destacados || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const obtenerImagen = (item) => item?.imagen1 || item?.imagen || '/placeholder.jpg';

    const categoriasConProductos = useMemo(() => {
        return categorias.filter((categoria) =>
            productos.some((producto) => producto?.idCategoria === categoria?.idCategoria)
        );
    }, [categorias, productos]);

    const productosFiltrados = useMemo(() => {
        if (categoriaSeleccionada === 'Todo') return productos;
        return productos.filter((item) => item.idCategoria === categoriaSeleccionada);
    }, [categoriaSeleccionada, productos]);

    const nombreCategoriaSeleccionada = useMemo(() => {
        if (categoriaSeleccionada === 'Todo') return 'Todo';
        return (
            categoriasConProductos.find(
                (cat) => cat.idCategoria === categoriaSeleccionada
            )?.categoria || 'Categoría'
        );
    }, [categoriaSeleccionada, categoriasConProductos]);

    return (
        <div className="ProductsContain">
            <ToastContainer />

            <section className="productsHero">
                <div className="productsHeroContent">
                    <span className="productsHeroTag">Catálogo destacado</span>

                    <h1>Catálogo de productos importados en Costa Rica</h1>

                    <p>
                        Descubre nuestro catálogo de productos importados disponibles en Costa Rica.
                        Ofrecemos soluciones modernas y de alta calidad en diferentes categorías,
                        pensadas para clientes que buscan productos confiables y duraderos.
                        Explora nuestras colecciones y encuentra el producto ideal para tu proyecto o negocio.
                    </p>
                </div>
            </section>

            {productos.length > 0 && (
                <div
                    className={`categoriasInputs ${fixedCategories ? 'fixed' : ''}`}
                    ref={categoriasInputRef}
                >
                    <button
                        type="button"
                        className={`categoriaChip ${categoriaSeleccionada === 'Todo' ? 'active' : ''}`}
                        onClick={() => handleClickCategoria('Todo')}
                    >
                        Todo
                    </button>

                    {categoriasConProductos.map(({ categoria, idCategoria }) => (
                        <button
                            type="button"
                            key={idCategoria}
                            className={`categoriaChip ${categoriaSeleccionada === idCategoria ? 'active' : ''}`}
                            onClick={() => handleClickCategoria(idCategoria)}
                        >
                            {categoria}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <ProductosLoading />
            ) : (
                <div className="Products">
                    {categoriaSeleccionada === 'Todo' && (
                        <>
                            {destacados.length > 0 && (
                                <section className="featuredSection">
                                    <div className="sectionHeading">
                                        <div>
                                            <span className="sectionMiniTitle">
                                                <FontAwesomeIcon icon={faFireFlameCurved} />
                                                Destacados
                                            </span>
                                            <h2>Lo más vendido</h2>
                                        </div>
                                    </div>

                                    <Swiper
                                        grabCursor={true}
                                        slidesPerView={'auto'}
                                        spaceBetween={18}
                                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                                        id="swiper_container_products_featured"
                                    >
                                        {destacados.map((item) => (
                                            <SwiperSlide
                                                key={item.idDestacado}
                                                className="featuredSlide"
                                            >
                                                <div className="featuredCard">
                                                    <div className="featuredImageWrap">
                                                        <img
                                                            src={item.imagen}
                                                            alt={item.titulo || 'Producto destacado'}
                                                            loading="lazy"
                                                        />
                                                        <span className="featuredBadge">Más vendido</span>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </section>
                            )}

                            {categoriasConProductos.map(({ categoria, idCategoria }) => {
                                const productosPorCategoria = productos.filter(
                                    (item) => item.idCategoria === idCategoria
                                );

                                return (
                                    <section key={idCategoria} className="categoriSection">
                                        <div className="sectionHeading">
                                            <div>
                                                <span className="sectionMiniTitle">Colección</span>
                                                <h2>{categoria}</h2>
                                            </div>

                                            <button
                                                type="button"
                                                className="seeMoreBtn"
                                                onClick={() => handleClickCategoria(idCategoria)}
                                            >
                                                Ver más
                                                <FontAwesomeIcon icon={faAngleRight} />
                                            </button>
                                        </div>

                                        <Swiper
                                            grabCursor={true}
                                            slidesPerView={'auto'}
                                            spaceBetween={18}
                                            id="swiper_container_products"
                                        >
                                            {productosPorCategoria.map((item) => (
                                                <SwiperSlide
                                                    className="productSlide"
                                                    key={item.idProducto}
                                                >
                                                    <Anchor
                                                        className="cardProduct"
                                                        to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}
                                                    >
                                                        <div className="cardImageWrap">
                                                            <img
                                                                src={obtenerImagen(item)}
                                                                alt={item.titulo}
                                                                loading="lazy"
                                                            />
                                                        </div>

                                                        <div className="cardText">
                                                            <h4>{item.titulo}</h4>

                                                            <p>{item.descripcion}</p>

                                                            <div className="cardActions">
                                                                <span className="verProducto">
                                                                    Ver producto
                                                                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Anchor>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </section>
                                );
                            })}
                        </>
                    )}

                    {categoriaSeleccionada !== 'Todo' && (
                        <section className="selectedSection">
                            <div className="sectionHeading selectedHeading">
                                <div>
                                    <span className="sectionMiniTitle">Resultados</span>
                                    <h2>{nombreCategoriaSeleccionada}</h2>
                                </div>
                            </div>

                            <div className="categoriSectionSelected">
                                {productosFiltrados.map((item) => (
                                    <Anchor
                                        key={item.idProducto}
                                        className="cardProductSelected"
                                        to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}
                                    >
                                        <div className="cardImageWrapSelected">
                                            <img
                                                src={obtenerImagen(item)}
                                                alt={item.titulo}
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="cardTextSelected">
                                            <h4>{item.titulo}</h4>
                                            <p>{item.descripcion}</p>

                                            <span className="cardAction">
                                                Ver producto
                                                <FontAwesomeIcon
                                                    icon={faArrowRight}
                                                    className="iconCard"
                                                />
                                            </span>
                                        </div>
                                    </Anchor>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}