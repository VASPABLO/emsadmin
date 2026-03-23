import React, { useState, useEffect } from "react";
import "./InputSearchs.css";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import baseURL from '../url';

export default function InputSearchs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

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
                setProductos(data.productos || []);
            })
            .catch(error => console.error('Error al cargar productos:', error));
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

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);

        const filteredResults = categorias.map((categoria) => {
            const productosFiltrados = productos.filter((producto) => {
                return (
                    producto.idCategoria === categoria.idCategoria &&
                    (producto.titulo.toLowerCase().includes(searchTerm) ||
                        categoria.categoria.toLowerCase().includes(searchTerm))
                );
            });

            return productosFiltrados.length > 0 ? { categoria, productos: productosFiltrados } : null;
        }).filter(result => result !== null);

        setFilteredResults(filteredResults);
        setShowResults(searchTerm !== "");
        setNoResults(searchTerm !== "" && filteredResults.length === 0);
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSearchTerm('');
        setFilteredResults([]);
        setShowResults(false);
        setNoResults(false);
    };

    return (
        <div className="nav-search">
            <div className="nav-search__container">
                <button type="button" className="nav-search__trigger" onClick={openModal} aria-label="Buscar productos">
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Buscar</span>
                </button>

                <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="nav-search__modal" overlayClassName="nav-search__overlay">
                    <div className="nav-search__header">
                        <h3>Buscar productos</h3>
                        <button type="button" onClick={closeModal} className="nav-search__close" aria-label="Cerrar búsqueda">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <fieldset className="nav-search__field">
                        <FontAwesomeIcon icon={faSearch} className="nav-search__field-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o categoría..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="nav-search__input"
                        />
                    </fieldset>

                    {!showResults && (
                        <p className="nav-search__hint">Escribe para ver coincidencias en productos y categorías.</p>
                    )}

                    {showResults && (
                        <div className="nav-search__results">
                            {filteredResults.map(({ categoria, productos }) => (
                                <div key={categoria.idCategoria} className="nav-search__section">
                                    <h3>{categoria.categoria}</h3>
                                    {productos.map((producto) => (
                                        <div key={producto.idProducto}>
                                            <Link
                                                to={`/producto/${producto.idProducto}/${producto.titulo.replace(/\s+/g, '-')}`}
                                                onClick={closeModal}
                                                className="nav-search__item"
                                            >
                                                <img src={producto.imagen1} alt="" />
                                                <p>{producto.titulo}</p>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {noResults && <p className="nav-search__empty">No se encontraron resultados.</p>}
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
