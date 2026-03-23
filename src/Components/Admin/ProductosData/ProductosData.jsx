import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faEdit,
    faArrowUp,
    faArrowDown,
    faSync,
    faEye,
    faBoxOpen,
    faTableCellsLarge,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './ProductosData.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewProduct from '../NewProduct/NewProduct';
import { Link as Anchor } from "react-router-dom";

export default function ProductosData() {
    const [productos, setProductos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    const [nuevoPrecioAnterior, setNuevoPrecioAnterior] = useState(0);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [producto, setProducto] = useState({});
    const [modalImagenVisible, setModalImagenVisible] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState('');
    const [filtroId, setFiltroId] = useState('');
    const [filtroTitulo, setFiltroTitulo] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroMasVendido, setFiltroMasVendido] = useState('');
    const [ordenInvertido, setOrdenInvertido] = useState(false);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [selectedSection, setSelectedSection] = useState('texto');
    const [categorias, setCategoras] = useState([]);

    const limpiarPreviewImagen = () => {
        if (imagenPreview) {
            URL.revokeObjectURL(imagenPreview);
        }

        setImagenPreview(null);
        setNuevaImagen(null);
    };

    const cerrarModalImagen = () => {
        setModalImagenVisible(false);
    };

    const abrirModalImagenSeleccionada = (imagen) => {
        setImagenSeleccionada(imagen);
        setModalImagenVisible(true);
    };


    useEffect(() => {
        cargarProductos();

    }, []);

    useEffect(() => {
        // Actualiza el valor del select cuando cambia el estado nuevoEstado
        setNuevoTitulo(producto.titulo);
        setNuevaDescripcion(producto.descripcion);
        setNuevaCategoria(producto.idCategoria)
        setNuevoPrecioAnterior(producto.precioAnterior)
    }, [producto]);

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

    const eliminarProducto = (idProducto) => {
        // Reemplaza el window.confirm con SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/productDelete.php?idProducto=${idProducto}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarProductos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar la Producto:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        limpiarPreviewImagen();
        setProducto(item);
        setNuevoTitulo(item.titulo);
        setNuevaDescripcion(item.descripcion);
        setNuevaCategoria(item.idCategoria);
        setSelectedSection('texto');
        setModalVisible(true);
    };

    const cerrarModal = () => {
        limpiarPreviewImagen();
        setSelectedSection('texto');
        setModalVisible(false);
    };

    const productosFiltrados = productos.filter(item => {
        const idMatch = item.idProducto.toString().includes(filtroId);
        const tituloMatch = !filtroTitulo || item.titulo.includes(filtroTitulo);
        const categoriaMatch = !filtroCategoria || item.idCategoria.toString() === filtroCategoria;
        const masVendidoMatch = !filtroMasVendido || String(item.masVendido || '').includes(filtroMasVendido);
        return idMatch && tituloMatch && categoriaMatch && masVendidoMatch;
    });

    const descargarExcel = () => {
        const data = productosFiltrados.map(item => ({
            IdProducto: item.idProducto,
            Titulo: item.titulo,
            Descripcion: item.descripcion,
            Precio: item.precio,
            Fecha: item.createdAt,
            MasVendido: item.masVendido,
            Imagen1: item.imagen1,
            Imagen2: item.imagen2,
            Imagen3: item.imagen3,
            Imagen4: item.imagen4,

        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');
        XLSX.writeFile(wb, 'productos.xlsx');
    };

    const descargarPDF = () => {
        const pdf = new jsPDF();
        pdf.text('Lista de Productos', 10, 10);

        const columns = [
            { title: 'IdProducto', dataKey: 'idProducto' },
            { title: 'Titulo', dataKey: 'titulo' },
            { title: 'Descripcion', dataKey: 'descripcion' },
            { title: 'Precio', dataKey: 'precio' },
            { title: 'MasVendido', dataKey: 'masVendido' },
            { title: 'Fecha', dataKey: 'createdAt' },
        ];

        const data = productosFiltrados.map(item => ({
            IdProducto: item.idProducto,
            Titulo: item.titulo,
            Descripcion: item.descripcion,
            Precio: item.precio,
            MasVendido: item.masVendido,
            Fecha: item.createdAt,

        }));

        pdf.autoTable({
            head: [columns.map(col => col.title)],
            body: data.map(item => Object.values(item)),
        });

        pdf.save('productos.pdf');
    };

    const recargarProductos = () => {
        cargarProductos();
    };
    const invertirOrden = () => {
        setProductos([...productos].reverse());
        setOrdenInvertido(!ordenInvertido);
    };


    const handleUpdateText = (idProducto) => {
        const payload = {

            nuevoTitulo: nuevoTitulo !== '' ? nuevoTitulo : producto.titulo,
            nuevaDescripcion: nuevaDescripcion !== undefined ? nuevaDescripcion : producto.descripcion,
            nuevoPrecio: producto.precio,
            nuevaCategoria: nuevaCategoria !== '' ? nuevaCategoria : producto.idCategoria,
            item1: producto.item1,
            item2: producto.item2,
            item3: producto.item3,
            item4: producto.item4,
            item5: producto.item5,
            item6: producto.item6,
            item7: producto.item7,
            item8: producto.item8,
            item9: producto.item9,
            item10: producto.item10,
            precioAnterior: nuevoPrecioAnterior !== 0 ? nuevoPrecioAnterior : producto.precioAnterior,
        };

        fetch(`${baseURL}/productoTextPut.php?idProducto=${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {

                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {

                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarProductos();
                    cerrarModal()
                }
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    const handleFileChange = (event, setFile, setPreview) => {
        const file = event.target.files[0];

        if (file) {
            if (imagenPreview) {
                URL.revokeObjectURL(imagenPreview);
            }

            // Crear una URL de objeto para la imagen seleccionada
            const previewURL = URL.createObjectURL(file);
            setFile(file);
            setPreview(previewURL);
        }
    };
    const handleEditarImagenBanner = (idProducto) => {
        if (!nuevaImagen) {
            toast.error('Selecciona una imagen antes de guardar.');
            return;
        }

        const formData = new FormData();
        formData.append('idProducto', idProducto);
        formData.append('updateAction', 'update'); // Campo adicional para indicar que es una actualización

        if (nuevaImagen) {
            formData.append('imagen1', nuevaImagen);
        }

        fetch(`${baseURL}/productoImagePut.php`, {
            method: 'POST',  // Cambiado a POST
            body: formData
        })
            .then(response => {
                // Manejar el caso cuando la respuesta no es un JSON válido o está vacía
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');

                }

                return response.json();
            })
            .then(data => {
                if (data.error) {

                    toast.error(data.error);
                } else {

                    toast.success(data.mensaje);
                    cargarProductos();
                    limpiarPreviewImagen();
                }
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    useEffect(() => {
        cargarCategoria();
    }, []);


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };

    return (
        <section className='productosAdmin'>
            <ToastContainer />

            <NewProduct onCreated={cargarProductos} />

            <div className='productosAdmin__header'>
                <div>
                    <span className='productosAdmin__badge'>
                        <FontAwesomeIcon icon={faBoxOpen} />
                        Gestión de catálogo
                    </span>
                    <h1>Productos</h1>
                    <p>Gestiona productos, categorías, imágenes y contenido del catálogo.</p>
                </div>

                <div className='productosAdmin__actions'>
                    <button className='excel' onClick={descargarExcel}><FontAwesomeIcon icon={faArrowDown} /> Excel</button>
                    <button className='pdf' onClick={descargarPDF}><FontAwesomeIcon icon={faArrowDown} /> PDF</button>
                    <button className='reload' onClick={recargarProductos}><FontAwesomeIcon icon={faSync} /> Recargar</button>
                </div>
            </div>

            <div className='productosAdmin__topbar'>
                <div className='statCard'>
                    <span>Total productos</span>
                    <strong>{productos.length}</strong>
                </div>

                <div className='statCard'>
                    <span>Resultados filtrados</span>
                    <strong>{productosFiltrados.length}</strong>
                </div>

                <div className='statCard'>
                    <span>Categorías disponibles</span>
                    <strong>{categorias.length}</strong>
                </div>
            </div>

            <div className='filtrosContain'>
                <div className='inputsColumn'>
                    <label>ID</label>
                    <input type="number" value={filtroId} onChange={(e) => setFiltroId(e.target.value)} placeholder='Id Producto' />
                </div>

                <div className='inputsColumn'>
                    <label>Título</label>
                    <input type="text" value={filtroTitulo} onChange={(e) => setFiltroTitulo(e.target.value)} placeholder='Título' />
                </div>

                <div className='inputsColumn'>
                    <label>Categoría</label>
                    <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                        <option value="">Categorias</option>
                        {
                            categorias.map(item => (
                                <option key={item?.idCategoria} value={item?.idCategoria}>{item?.categoria}</option>
                            ))
                        }
                    </select>
                </div>

                <div className='inputsColumn'>
                    <label>Más vendido</label>
                    <select value={filtroMasVendido} onChange={(e) => setFiltroMasVendido(e.target.value)}>
                        <option value="">Más vendidos</option>
                        <option value="si">Si</option>
                        <option value="no">No</option>
                    </select>
                </div>

                <button className='reverse' onClick={invertirOrden}>
                    {ordenInvertido ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />} Orden
                </button>
            </div>

            {modalImagenVisible && (
                <div className="modalImg">
                    <div className="modal-contentImg">


                        <span className="close2" onClick={cerrarModalImagen}>
                            &times;
                        </span>

                        <img src={imagenSeleccionada} alt="Imagen Seleccionada" />
                    </div>
                </div>
            )}

            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>

                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    type='button'
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Editar Texto
                                </button>
                                <button
                                    className={selectedSection === 'imagenes' ? 'selected' : ''}
                                    type='button'
                                    onClick={() => handleSectionChange('imagenes')}
                                >
                                    Editar Imagenes
                                </button>
                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Titulo</legend>
                                    <input
                                        type="text"
                                        value={nuevoTitulo !== '' ? nuevoTitulo : producto.titulo}
                                        onChange={(e) => setNuevoTitulo(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset id='descripcion'>
                                    <legend>Descripcion</legend>
                                    <textarea
                                        type="text"
                                        value={nuevaDescripcion}
                                        onChange={(e) => setNuevaDescripcion(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Categoria</legend>
                                    <select
                                        value={nuevaCategoria !== '' ? nuevaCategoria : producto.idCategoria}
                                        onChange={(e) => setNuevaCategoria(e.target.value)}
                                    >
                                        <option value=''>Selecciona una categoría</option>
                                        {
                                            categorias.map(item => (
                                                <option key={item?.idCategoria} value={item?.idCategoria}>{item?.categoria}</option>
                                            ))
                                        }
                                    </select>
                                </fieldset>

                                <fieldset>
                                    <legend>Precio anterior</legend>
                                    <input
                                        type="number"
                                        value={nuevoPrecioAnterior !== '' ? nuevoPrecioAnterior : producto.precioAnterior}
                                        onChange={(e) => setNuevoPrecioAnterior(e.target.value)}
                                    />
                                </fieldset>
                            </div>




                            <button type='button' className='btnPost' onClick={() => handleUpdateText(producto.idProducto)} >Guardar </button>

                        </div>

                        <div className='sectionImg' style={{ display: selectedSection === 'imagenes' ? 'flex' : 'none' }}>
                            <div className='previewEditCard'>
                                <div className='previewEditCard__head'>Vista previa</div>

                                <div className='previevProduct'>
                                    {imagenPreview ? (
                                        <img
                                            src={imagenPreview}
                                            alt='Vista previa de la imagen'
                                            onClick={() => abrirModalImagenSeleccionada(imagenPreview)}
                                        />
                                    ) : (
                                        <>
                                            {producto.imagen1 ? (
                                                <img
                                                    src={producto.imagen1}
                                                    alt='imagen'
                                                    onClick={() => abrirModalImagenSeleccionada(producto.imagen1)}
                                                />
                                            ) : (
                                                <span className='imgNone'>
                                                    No hay imagen
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <fieldset>
                                <legend>Editar Imagen1 </legend>
                                <input type='file' accept='image/*' onChange={(e) => handleFileChange(e, setNuevaImagen, setImagenPreview)} />
                            </fieldset>

                            <div className='sectionImg__actions'>
                                <button type='button' className='btnPost' onClick={() => handleEditarImagenBanner(producto.idProducto)}>Guardar </button>
                                <button type='button' className='btnPost btnPost--ghost' onClick={limpiarPreviewImagen}>Quitar seleccion</button>
                            </div>
                        </div>



                    </div>
                </div>
            )}

            <div className='table-container'>
                <div className='tableHeaderLite'>
                    <h3><FontAwesomeIcon icon={faTableCellsLarge} /> Tabla de productos</h3>
                    <p>Puedes editar, eliminar o previsualizar cada producto.</p>
                </div>

                <table className='table'>
                    <thead>
                        <tr>
                            <th>Id Producto</th>
                            <th>Titulo</th>
                            <th>Categoria</th>
                            <th>Imagen</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map(item => (
                            <tr key={item.idProducto}>
                                <td>{item.idProducto}</td>
                                <td>{item.titulo}</td>

                                {categorias
                                    .filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                    .map(categoriaFiltrada => (
                                        <td
                                            key={categoriaFiltrada.idCategoria}
                                            style={{ color: '#DAA520' }}
                                        >
                                            {categoriaFiltrada.categoria}
                                        </td>
                                    ))
                                }

                                <td>
                                    {item.imagen1 ? (
                                        <img src={item.imagen1} alt="imagen1" />
                                    ) : (
                                        <span className='imgNonetd'>
                                            Sin imagen
                                        </span>
                                    )}
                                </td>

                                <td>

                                    <button className='eliminar' onClick={() => eliminarProducto(item.idProducto)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button className='editar' onClick={() => abrirModal(item)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <Anchor className='editar' to={`/producto/${item?.idProducto}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                        <FontAwesomeIcon icon={faEye} />
                                    </Anchor>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </section>
    );
};
