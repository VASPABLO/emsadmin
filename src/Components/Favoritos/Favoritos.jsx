import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import baseURL from '../url';
import './Favoritos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
import moneda from '../moneda';
export default function Favoritos() {
    const [favoritos, setFavoritos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    useEffect(() => {
        cargarProductos();
    }, []);

    useEffect(() => {
        if (modalIsOpen) {
            cargarFavoritos();
        }
    }, [modalIsOpen]);

    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
                setLoading(false); // Marcamos como cargados los productos
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                setLoading(false); // En caso de error, marcamos como cargados para evitar bucles
            });
    };

    const cargarFavoritos = () => {
        const storedFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        setFavoritos(storedFavoritos);
    };

    const obtenerImagen = (item) => {
        return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const eliminarProducto = (id) => {
        const updatedFavoritos = favoritos.filter(itemId => itemId !== id);
        setFavoritos(updatedFavoritos);
        localStorage.setItem('favoritos', JSON.stringify(updatedFavoritos));

    };

    return (
        <div className='nav-favorites'>
            <button onClick={openModal} className='nav-favorites__trigger' type='button' aria-label='Ver favoritos'>
                <FontAwesomeIcon icon={faHeart} />
                <span>Favoritos</span>
                {favoritos.length > 0 && <em>{favoritos.length}</em>}
            </button>

            <Modal
                isOpen={modalIsOpen}
                className="nav-favorites__modal"
                overlayClassName="nav-favorites__overlay"
                onRequestClose={closeModal}
            >
                <div className='nav-favorites__header'>
                    <button onClick={closeModal} type='button' className='nav-favorites__back'>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h3>Favoritos</h3>
                    <span>{favoritos.length} item(s)</span>
                </div>
                {favoritos?.length === 0 ? (
                    <p className='nav-favorites__empty'>No hay favoritos guardados.</p>
                ) : (
                    <div className="nav-favorites__content">
                        {loading ? (
                            <p className='nav-favorites__loading'>Cargando...</p>
                        ) : (
                            <div className='nav-favorites__list'>
                                {favoritos.map((id) => {
                                    const favoriteId = Number(id);
                                    const producto = productos.find(prod => Number(prod.idProducto) === favoriteId);
                                    if (!producto) return null;
                                    return (


                                        <div key={producto.idProducto} className='nav-favorites__card' >
                                            <Anchor to={`/producto/${producto?.idProducto}/${producto?.titulo?.replace(/\s+/g, '-')}`} onClick={closeModal} >
                                                <img src={obtenerImagen(producto)} alt="imagen" />
                                            </Anchor>
                                            <div className='nav-favorites__text'>
                                                <h3>{producto.titulo}</h3>
                                                <span>{producto.categoria}</span>
                                                <strong> {moneda} {producto?.precio?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</strong>

                                            </div>
                                            <button onClick={() => eliminarProducto(id)} className='nav-favorites__delete' type='button' aria-label='Eliminar de favoritos'>
                                                <FontAwesomeIcon icon={faHeart} />
                                            </button>
                                        </div>


                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
