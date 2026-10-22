import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCartPlus,
    faTrash,
    faPaperPlane,
    faMinus,
    faPlus,
    faUserCheck,
    faSearch,
    faSliders,
    faXmark,
    faCartShopping,
} from '@fortawesome/free-solid-svg-icons';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import './CatalogoVendedor.css';

export default function CatalogoVendedor() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [carrito, setCarrito] = useState([]); // [{idProducto, titulo, precio, precioMinimo, precioMaximo, precioVenta, stock, cantidad, imagen}]
    const [enviando, setEnviando] = useState(false);

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [entrega, setEntrega] = useState('');
    const [nota, setNota] = useState('');
    const [pago, setPago] = useState('efectivo');
    const [clienteEncontrado, setClienteEncontrado] = useState(false);
    const [pedidoAbierto, setPedidoAbierto] = useState(false);

    useEffect(() => {
        cargarProductos();
        cargarCategorias();

        // El stock cambia cuando la cajera factura un pedido, en otra pantalla.
        // Al volver a esta pestaña se recargan los productos para que
        // "Disponible" muestre el número real y no uno viejo.
        const refrescarSiVuelve = () => {
            if (document.visibilityState === 'visible') {
                cargarProductos();
            }
        };

        window.addEventListener('focus', refrescarSiVuelve);
        document.addEventListener('visibilitychange', refrescarSiVuelve);

        return () => {
            window.removeEventListener('focus', refrescarSiVuelve);
            document.removeEventListener('visibilitychange', refrescarSiVuelve);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Autocompletar cliente: al escribir un teléfono (8+ dígitos) o un email válido,
    // busca en pedidos anteriores y, si hay coincidencia, rellena los campos que
    // el vendedor todavía no haya escrito (sin pisar lo que ya ingresó a mano).
    useEffect(() => {
        const telefonoLimpio = telefono.trim();
        if (telefonoLimpio.length < 8) return;

        const timer = setTimeout(() => {
            buscarCliente({ telefono: telefonoLimpio });
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [telefono]);

    useEffect(() => {
        const emailLimpio = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) return;

        const timer = setTimeout(() => {
            buscarCliente({ email: emailLimpio });
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const buscarCliente = (params) => {
        const query = new URLSearchParams(params).toString();
        apiFetch(`${baseURL}/pedidos/clienteBuscarGet.php?${query}`, { method: 'GET' })
            .then((r) => r.json())
            .then((data) => {
                const cliente = data?.cliente;
                if (!cliente) return;

                setNombre((prev) => (prev.trim() ? prev : cliente.nombre || ''));
                setEmail((prev) => (prev.trim() ? prev : cliente.email || ''));
                setTelefono((prev) => (prev.trim() ? prev : cliente.telefono || ''));
                setClienteEncontrado(true);
            })
            .catch((error) => console.error('Error al buscar cliente:', error));
    };

    const cargarProductos = () => {
        apiFetch(`${baseURL}/productos/productosGet.php`, { method: 'GET' })
            .then((r) => r.json())
            .then((data) => setProductos(data.productos || []))
            .catch((error) => console.error('Error al cargar productos:', error));
    };

    const cargarCategorias = () => {
        apiFetch(`${baseURL}/categorias/categoriasGet.php`, { method: 'GET' })
            .then((r) => r.json())
            .then((data) => setCategorias(data.categorias || []))
            .catch((error) => console.error('Error al cargar categorías:', error));
    };

    const obtenerNombreCategoria = (idCategoria) => {
        const categoria = categorias.find((c) => String(c.idCategoria) === String(idCategoria));
        return categoria?.categoria || 'Categoría';
    };

    const obtenerImagen = (item) => item?.imagen1 || item?.imagen2 || item?.imagen3 || item?.imagen4 || null;

    const productosFiltrados = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        return productos.filter((p) => {
            const coincideTexto = !term || (p.titulo || '').toLowerCase().includes(term);
            const coincideCategoria = !categoriaFiltro || String(p.idCategoria) === categoriaFiltro;
            return coincideTexto && coincideCategoria;
        });
    }, [productos, busqueda, categoriaFiltro]);

    const limpiarFiltrosCatalogo = () => {
        setBusqueda('');
        setCategoriaFiltro('');
    };

    const cantidadEnCarrito = (idProducto) => {
        const item = carrito.find((i) => i.idProducto === idProducto);
        return item ? item.cantidad : 0;
    };

    const agregarAlCarrito = (producto) => {
        const stockDisponible = Number(producto.stock ?? 0);
        const enCarrito = cantidadEnCarrito(producto.idProducto);

        if (stockDisponible > 0 && enCarrito >= stockDisponible) {
            toast.error('No hay más stock disponible de este producto');
            return;
        }

        setCarrito((prev) => {
            const existe = prev.find((i) => i.idProducto === producto.idProducto);
            if (existe) {
                return prev.map((i) =>
                    i.idProducto === producto.idProducto ? { ...i, cantidad: i.cantidad + 1 } : i
                );
            }
            const precio = Number(producto.precio) || 0;
            return [
                ...prev,
                {
                    idProducto: producto.idProducto,
                    titulo: producto.titulo,
                    imagen: obtenerImagen(producto),
                    precio,
                    precioMinimo: producto.precioMinimo !== undefined && producto.precioMinimo !== null ? Number(producto.precioMinimo) : null,
                    precioMaximo: producto.precioMaximo !== undefined && producto.precioMaximo !== null ? Number(producto.precioMaximo) : null,
                    precioVenta: precio,
                    stock: stockDisponible,
                    cantidad: 1,
                },
            ];
        });
    };

    const cambiarCantidad = (idProducto, cantidad) => {
        setCarrito((prev) =>
            prev.map((i) => {
                if (i.idProducto !== idProducto) return i;
                let cantidadNum = Math.max(1, Number(cantidad) || 1);
                if (i.stock > 0) cantidadNum = Math.min(cantidadNum, i.stock);
                return { ...i, cantidad: cantidadNum };
            })
        );
    };

    const cambiarPrecioVenta = (idProducto, valor) => {
        setCarrito((prev) =>
            prev.map((i) => {
                if (i.idProducto !== idProducto) return i;
                if (valor === '') return { ...i, precioVenta: '' };
                let numero = Number(valor);
                if (i.precioMinimo !== null) numero = Math.max(numero, i.precioMinimo);
                if (i.precioMaximo !== null) numero = Math.min(numero, i.precioMaximo);
                return { ...i, precioVenta: numero };
            })
        );
    };

    const quitarDelCarrito = (idProducto) => {
        setCarrito((prev) => prev.filter((i) => i.idProducto !== idProducto));
    };

    const total = useMemo(
        () => carrito.reduce((acc, i) => acc + (Number(i.precioVenta) || 0) * i.cantidad, 0),
        [carrito]
    );

    const totalUnidades = useMemo(
        () => carrito.reduce((acc, i) => acc + i.cantidad, 0),
        [carrito]
    );

    const limpiarFormulario = () => {
        setCarrito([]);
        setNombre('');
        setEmail('');
        setTelefono('');
        setEntrega('');
        setNota('');
        setPago('efectivo');
        setClienteEncontrado(false);
        setPedidoAbierto(false);
    };

    const enviarPedido = async () => {
        if (carrito.length === 0) {
            toast.error('Agrega al menos un producto al pedido');
            return;
        }
        if (!nombre.trim() || !email.trim() || !telefono.trim() || !entrega.trim()) {
            toast.error('Completa los datos del cliente');
            return;
        }

        setEnviando(true);
        try {
            const response = await apiFetch(`${baseURL}/pedidos/pedidoInternoPost.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productos: carrito.map((i) => ({
                        idProducto: i.idProducto,
                        cantidad: i.cantidad,
                        precioVenta: i.precioVenta,
                    })),
                    nombre,
                    email,
                    telefono,
                    entrega,
                    nota,
                    pago,
                }),
            });

            const data = await response.json();

            if (data.mensaje) {
                toast.success(data.mensaje);
                limpiarFormulario();
                cargarProductos();
            } else if (data.error) {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error al enviar pedido:', error);
            toast.error('Error de conexión al enviar el pedido');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className='catalogoVendedor'>
            <div className='catalogoVendedor__page'>
                <section className='catalogoVendedor__catalogo'>
                    <div className='catalogoVendedor__hero'>
                        <span className='catalogoVendedor__heroBadge'>Catálogo EMS</span>
                        <h2>Arma el pedido del cliente</h2>
                        <p>Busca el producto, agrégalo al carrito y completa los datos del cliente.</p>
                    </div>

                    <div className='catalogoVendedor__filtros'>
                        <div className='catalogoVendedor__filtrosHeader'>
                            <div className='catalogoVendedor__filtrosTitle'>
                                <FontAwesomeIcon icon={faSliders} />
                                <span>Filtros</span>
                            </div>
                            <button type='button' className='catalogoVendedor__clearBtn' onClick={limpiarFiltrosCatalogo}>
                                <FontAwesomeIcon icon={faXmark} />
                                Limpiar
                            </button>
                        </div>

                        <div className='catalogoVendedor__search'>
                            <FontAwesomeIcon icon={faSearch} className='catalogoVendedor__searchIcon' />
                            <input
                                type='text'
                                placeholder='Buscar producto...'
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <label className='catalogoVendedor__filterField'>
                            <span>Categoría</span>
                            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                                <option value=''>Todas las categorías</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.idCategoria} value={categoria.idCategoria}>
                                        {categoria.categoria}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className='catalogoVendedor__resultsBar'>
                        <h3>{productosFiltrados.length} productos encontrados</h3>
                        <p>Elige los productos para este pedido.</p>
                    </div>

                    <div className='catalogoVendedor__lista'>
                        {productosFiltrados.map((producto) => {
                            const stockDisponible = Number(producto.stock ?? 0);
                            const imagen = obtenerImagen(producto);
                            const tieneRango = producto.precioMinimo != null && producto.precioMaximo != null;

                            return (
                                <div key={producto.idProducto} className='catalogoVendedor__card'>
                                    <div className='catalogoVendedor__cardImage'>
                                        {imagen ? (
                                            <img src={imagen} alt={producto.titulo} loading='lazy' />
                                        ) : (
                                            <div className='catalogoVendedor__cardImagePlaceholder'>Sin imagen</div>
                                        )}
                                        <span className='catalogoVendedor__cardBadge'>
                                            {obtenerNombreCategoria(producto.idCategoria)}
                                        </span>
                                    </div>

                                    <div className='catalogoVendedor__cardBody'>
                                        <h4>{producto.titulo}</h4>
                                        <p className='catalogoVendedor__cardDesc'>
                                            {producto.descripcion || 'Producto disponible en catálogo.'}
                                        </p>

                                        <div className='catalogoVendedor__vendorRow'>
                                            <div className='catalogoVendedor__priceArea'>
                                                <span className='catalogoVendedor__precio'>
                                                    ₡{Number(producto.precio || 0).toLocaleString('es-CR')}
                                                </span>
                                                {tieneRango && (
                                                    <span className='catalogoVendedor__rango'>
                                                        Rango: ₡{Number(producto.precioMinimo).toLocaleString('es-CR')} – ₡{Number(producto.precioMaximo).toLocaleString('es-CR')}
                                                    </span>
                                                )}
                                                <span
                                                    className={`catalogoVendedor__stock ${stockDisponible <= 0 ? 'catalogoVendedor__stock--agotado' : ''}`}
                                                >
                                                    Disponible: {stockDisponible}
                                                </span>
                                            </div>

                                            <button
                                                type='button'
                                                className='catalogoVendedor__agregarBtn'
                                                onClick={() => agregarAlCarrito(producto)}
                                                disabled={stockDisponible > 0 && cantidadEnCarrito(producto.idProducto) >= stockDisponible}
                                            >
                                                <FontAwesomeIcon icon={faCartPlus} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {productosFiltrados.length === 0 && (
                            <div className='catalogoVendedor__emptyProducts'>
                                <h3>No se encontraron productos</h3>
                                <p>Intenta cambiar los filtros o buscar con otro término.</p>
                                <button type='button' onClick={limpiarFiltrosCatalogo}>
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* FAB y hoja del pedido se montan con un portal directo a <body>: así su
                position:fixed queda relativo a la pantalla de verdad, sin importar si
                algún contenedor padre (ej. la animación de entrada del dashboard en
                Main.css) deja un transform aplicado que rompería el fixed normal. */}
            {carrito.length > 0 && !pedidoAbierto && createPortal(
                <button type='button' className='catalogoVendedor__fab' onClick={() => setPedidoAbierto(true)}>
                    <span className='catalogoVendedor__fabIcon'>
                        <FontAwesomeIcon icon={faCartShopping} />
                        <span className='catalogoVendedor__fabCount'>{totalUnidades}</span>
                    </span>
                    <span className='catalogoVendedor__fabText'>Ver pedido</span>
                    <strong className='catalogoVendedor__fabTotal'>₡{total.toLocaleString('es-CR')}</strong>
                </button>,
                document.body
            )}

            {pedidoAbierto && createPortal(
                <div className='catalogoVendedor__sheetOverlay' onClick={() => setPedidoAbierto(false)}>
                    <section
                        className='catalogoVendedor__pedido catalogoVendedor__ticket catalogoVendedor__sheet'
                        onClick={(event) => event.stopPropagation()}
                    >
                    <div className='catalogoVendedor__sheetHandle' />
                    <div className='catalogoVendedor__ticketHead'>
                        <h3>Pedido</h3>
                        <div className='catalogoVendedor__ticketHeadRight'>
                            {carrito.length > 0 && (
                                <span className='catalogoVendedor__ticketBadge'>
                                    {totalUnidades} {totalUnidades === 1 ? 'artículo' : 'artículos'}
                                </span>
                            )}
                            <button
                                type='button'
                                className='catalogoVendedor__sheetClose'
                                onClick={() => setPedidoAbierto(false)}
                                aria-label='Cerrar pedido'
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </div>

                    {carrito.length === 0 ? (
                        <p className='catalogoVendedor__vacio'>Aún no agregaste productos.</p>
                    ) : (
                        <div className='catalogoVendedor__items'>
                            {carrito.map((item) => {
                                const tieneRango = item.precioMinimo !== null && item.precioMaximo !== null;
                                const alTope = item.stock > 0 && item.cantidad >= item.stock;
                                return (
                                    <div key={item.idProducto} className='catalogoVendedor__item'>
                                        <div className='catalogoVendedor__itemImg'>
                                            {item.imagen ? (
                                                <img src={item.imagen} alt={item.titulo} loading='lazy' />
                                            ) : (
                                                <div className='catalogoVendedor__itemImgPlaceholder'>Sin imagen</div>
                                            )}
                                        </div>

                                        <div className='catalogoVendedor__itemBody'>
                                            <div className='catalogoVendedor__itemHead'>
                                                <span className='catalogoVendedor__itemTitulo'>{item.titulo}</span>
                                                <button
                                                    type='button'
                                                    title='Quitar del pedido'
                                                    onClick={() => quitarDelCarrito(item.idProducto)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>

                                            <div className='catalogoVendedor__itemRow'>
                                                <div className='catalogoVendedor__stepper'>
                                                    <button
                                                        type='button'
                                                        onClick={() => cambiarCantidad(item.idProducto, item.cantidad - 1)}
                                                        disabled={item.cantidad <= 1}
                                                    >
                                                        <FontAwesomeIcon icon={faMinus} />
                                                    </button>
                                                    <input
                                                        type='number'
                                                        min='1'
                                                        max={item.stock > 0 ? item.stock : undefined}
                                                        value={item.cantidad}
                                                        onChange={(e) => cambiarCantidad(item.idProducto, e.target.value)}
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() => cambiarCantidad(item.idProducto, item.cantidad + 1)}
                                                        disabled={alTope}
                                                        title={alTope ? 'No hay más stock disponible' : undefined}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                </div>

                                                <label className='catalogoVendedor__itemField'>
                                                    <span>Precio{tieneRango ? ` (₡${item.precioMinimo.toLocaleString('es-CR')}–₡${item.precioMaximo.toLocaleString('es-CR')})` : ''}</span>
                                                    <input
                                                        type='number'
                                                        value={item.precioVenta}
                                                        min={item.precioMinimo ?? undefined}
                                                        max={item.precioMaximo ?? undefined}
                                                        disabled={!tieneRango}
                                                        onChange={(e) => cambiarPrecioVenta(item.idProducto, e.target.value)}
                                                    />
                                                </label>

                                                <span className='catalogoVendedor__itemSubtotal'>
                                                    ₡{((Number(item.precioVenta) || 0) * item.cantidad).toLocaleString('es-CR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className='catalogoVendedor__total'>
                        <span>Total</span>
                        <strong>₡{total.toLocaleString('es-CR')}</strong>
                    </div>

                    <div className='catalogoVendedor__form'>
                        {clienteEncontrado && (
                            <div className='catalogoVendedor__clienteEncontrado'>
                                <FontAwesomeIcon icon={faUserCheck} />
                                Cliente encontrado, datos completados automáticamente
                            </div>
                        )}
                        <label>
                            <span>Nombre del cliente</span>
                            <input type='text' value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </label>
                        <label>
                            <span>Email</span>
                            <input
                                type='email'
                                value={email}
                                onChange={(e) => {
                                    setClienteEncontrado(false);
                                    setEmail(e.target.value);
                                }}
                            />
                        </label>
                        <label>
                            <span>Teléfono</span>
                            <input
                                type='text'
                                value={telefono}
                                onChange={(e) => {
                                    setClienteEncontrado(false);
                                    setTelefono(e.target.value);
                                }}
                                placeholder='8 dígitos o más para buscar cliente'
                            />
                        </label>
                        <label>
                            <span>Entrega</span>
                            <input type='text' value={entrega} onChange={(e) => setEntrega(e.target.value)} placeholder='Retiro en tienda / dirección' />
                        </label>
                        <label>
                            <span>Nota</span>
                            <textarea value={nota} onChange={(e) => setNota(e.target.value)} />
                        </label>
                        <label>
                            <span>Pago</span>
                            <select value={pago} onChange={(e) => setPago(e.target.value)}>
                                <option value='efectivo'>Efectivo</option>
                                <option value='transferencia'>Transferencia</option>
                            </select>
                        </label>
                    </div>

                    <button
                        type='button'
                        className='catalogoVendedor__enviarBtn'
                        onClick={enviarPedido}
                        disabled={enviando}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        {enviando ? 'Enviando...' : 'Enviar pedido a caja'}
                    </button>
                    </section>
                </div>,
                document.body
            )}
        </div>
    );
}
