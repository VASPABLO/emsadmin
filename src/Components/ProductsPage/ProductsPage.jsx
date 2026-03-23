import React, { useEffect, useMemo, useState } from 'react';
import baseURL from '../url';
import './ProductsPage.css';
import 'react-toastify/dist/ReactToastify.css';
import ProductosLoading from '../ProductosLoading/ProductosLoading';
import { Link as Anchor } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSliders, faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function ProductsPage() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState('');
    const [searchText, setSearchText] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const productosData = data.productos || [];
                setProductos(productosData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                setLoading(false);
            });
    };

    const cargarCategorias = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategorias(data.categorias || []);
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const obtenerImagen = (item) => {
        return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
    };

    const handleSearchInputChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleItemSelect = (item) => {
        if (item === "") {
            setSelectedItems([]);
        } else {
            setSelectedItems([item]);
        }
    };

    const handleCategoriaSelect = (event) => {
        setCategoriasSeleccionadas(event.target.value);
    };

    const limpiarFiltros = () => {
        setCategoriasSeleccionadas('');
        setSearchText('');
        setSelectedItems([]);
    };

    const itemsDisponibles = useMemo(() => {
        return productos.reduce((items, item) => {
            for (let i = 1; i <= 10; i++) {
                const currentItem = item[`item${i}`];
                if (currentItem && !items.includes(currentItem)) {
                    items.push(currentItem);
                }
            }
            return items;
        }, []);
    }, [productos]);

    const filterProductos = (producto) => {
        const categoriaMatch =
            categoriasSeleccionadas === '' ||
            producto.idCategoria?.toString() === categoriasSeleccionadas;

        const searchTextMatch =
            searchText === '' ||
            producto.titulo?.toLowerCase().includes(searchText.toLowerCase());

        const itemMatches =
            selectedItems.length === 0 ||
            selectedItems.some(item =>
                producto.item1 === item ||
                producto.item2 === item ||
                producto.item3 === item ||
                producto.item4 === item ||
                producto.item5 === item ||
                producto.item6 === item ||
                producto.item7 === item ||
                producto.item8 === item ||
                producto.item9 === item ||
                producto.item10 === item
            );

        return categoriaMatch && searchTextMatch && itemMatches;
    };

    const productosFiltrados = productos.filter(filterProductos);

    const obtenerNombreCategoria = (idCategoria) => {
        const categoriaEncontrada = categorias.find(
            categoria => String(categoria.idCategoria) === String(idCategoria)
        );
        return categoriaEncontrada?.categoria || 'Categoría';
    };

    return (
        <section className='ProductsContainPage'>
            <div className='productsPageHero'>
                <div className='productsPageHero__content'>
                    <span className='productsPageHero__badge'>Catálogo EMS</span>
                    <h1>Encuentra el producto ideal para tu necesidad</h1>
                    <p>
                        Explora nuestro catálogo, filtra por categoría o item,
                        y descubre opciones pensadas para ti.
                    </p>
                </div>
            </div>

            {productos?.length > 0 && (
                <div className='filtrosWrapper'>
                    <div className='filtrosPage'>
                        <div className='filtrosHeader'>
                            <div className='filtrosTitle'>
                                <FontAwesomeIcon icon={faSliders} />
                                <span>Filtros</span>
                            </div>

                            <button
                                type="button"
                                className='clearFiltersBtn'
                                onClick={limpiarFiltros}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                                Limpiar
                            </button>
                        </div>

                        <div className='searchInput'>
                            <fieldset className="inputSearch">
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchText}
                                    onChange={handleSearchInputChange}
                                    className='input'
                                />
                            </fieldset>
                        </div>

                        <div className='inputsGrap'>
                            <div className='filterField'>
                                <label>Categoría</label>
                                <select
                                    value={categoriasSeleccionadas}
                                    onChange={handleCategoriaSelect}
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map(categoria => (
                                        <option key={categoria.idCategoria} value={categoria.idCategoria}>
                                            {categoria.categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='filterField'>
                                <label>Item</label>
                                <select
                                    value={selectedItems.length > 0 ? selectedItems[0] : ""}
                                    onChange={(e) => handleItemSelect(e.target.value)}
                                >
                                    <option value="">Todos los items</option>
                                    {itemsDisponibles.map((item, index) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </div>

                    <div className='resultsBar'>
                        <h3>{productosFiltrados.length} productos encontrados</h3>
                        <p>Explora las opciones disponibles en nuestro catálogo.</p>
                    </div>
                </div>
            )}

            <div>
                {loading ? (
                    <ProductosLoading />
                ) : (
                    <div className='ProductsGrap'>
                        {productosFiltrados.map(item => (
                            <Anchor
                                className='productCard'
                                key={item.idProducto}
                                to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}
                            >
                                <div className='productCard__imageWrap'>
                                    {obtenerImagen(item) ? (
                                        <img src={obtenerImagen(item)} alt={item.titulo} />
                                    ) : (
                                        <div className='productCard__placeholder'>Sin imagen</div>
                                    )}

                                    <div className='productCard__overlay'>
                                        <span>Ver detalles del producto</span>
                                    </div>

                                    <div className='productCard__badge'>
                                        {obtenerNombreCategoria(item.idCategoria)}
                                    </div>
                                </div>

                                <div className='productCard__content'>
                                    <h4>{item.titulo}</h4>

                                    <p className='productCard__desc'>
                                        {item.descripcion || 'Producto disponible en catálogo.'}
                                    </p>

                                    <div className='deFLexPrice'>
                                        <div className='productCard__action'>
                                            <span>Ver más</span>
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </div>
                                    </div>
                                </div>
                            </Anchor>
                        ))}

                        {!loading && productosFiltrados.length === 0 && (
                            <div className='emptyProducts'>
                                <h3>No se encontraron productos</h3>
                                <p>Intenta cambiar los filtros o buscar con otro término.</p>
                                <button type='button' onClick={limpiarFiltros}>
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}