import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faEye, faArrowUp, faArrowDown, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './PedidosData.css'
import 'jspdf-autotable';
import baseURL from '../../url';
import moneda from '../../moneda';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export default function PedidosData() {
    const [pedidos, setPedidos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [pedido, setPedido] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');

    const [filtroId, setFiltroId] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroDesde, setFiltroDesde] = useState('');
    const [filtroHasta, setFiltroHasta] = useState('');
    const [ordenInvertido, setOrdenInvertido] = useState(false);
    useEffect(() => {
        cargarPedidos();
    }, []);


    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(data.pedidos.reverse() || []);
                console.log(data.pedidos)
            })
            .catch(error => console.error('Error al cargar pedidos:', error));
    };

    const eliminar = (idPedido) => {
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
                fetch(`${baseURL}/pedidoDelete.php?idPedido=${idPedido}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarPedidos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar :', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setPedido(item);
        setNuevoEstado(item.estado)
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleUpdateText = (idPedido) => {
        const payload = {
            estado: nuevoEstado !== '' ? nuevoEstado : pedido.estado,
        };

        fetch(`${baseURL}/pedidoPut.php?idPedido=${idPedido}`, {
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
                    cargarPedidos();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };



    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const filtrados = pedidos.filter(item => {
        const idMatch = item.idPedido.toString().includes(filtroId);
        const estadoMatch = !filtroEstado || item.estado.includes(filtroEstado);
        const desdeMatch = !filtroDesde || new Date(item.createdAt) >= new Date(filtroDesde);

        // Incrementamos la fecha "hasta" en un día para que incluya la fecha seleccionada
        const adjustedHasta = new Date(filtroHasta);
        adjustedHasta.setDate(adjustedHasta.getDate() + 1);

        const hastaMatch = !filtroHasta || new Date(item.createdAt) < adjustedHasta;
        return idMatch && estadoMatch && desdeMatch && hastaMatch;
    });


    const recargarProductos = () => {
        cargarPedidos();
    };
    const invertirOrden = () => {
        setPedidos([...pedidos].reverse());
        setOrdenInvertido(!ordenInvertido);
    };
    const descargarExcel = () => {
        let totalGeneral = 0;

        const data = filtrados.map(item => {
            const total = parseFloat(item.total); // Convertir a número
            totalGeneral += total;
            const productos = JSON.parse(item.productos);
            const infoProductos = productos.map(producto => `${producto.titulo} - ${moneda}${producto.precio} - x${producto.cantidad}  `);
            return {
                'ID Pedido': item.idPedido,
                'Estado': item.estado,
                'Nombre': item.nombre,
                'Email': item.email,
                'Telefono': item.telefono,
                'Pago': item.pago,
                'Entrega': item.entrega,
                'Nota': item.nota,
                'Productos': infoProductos.join('\n'),
                'Codigo': item.codigo,
                'Total': `${moneda} ${total.toFixed(2)}`,
                'Fecha': item.createdAt,
            };
        });

        // Formatear el total general
        const formattedTotal = `${moneda} ${totalGeneral.toFixed(2)}`;

        // Agregar fila con el total general
        const totalRow = {

            'ID Pedido': '',
            'Estado': '',
            'Nombre': '',
            'Email': '',
            'Telfono': '',
            'Pago': '',
            'Entrega': '',
            'Nota': '',
            'Productos': '',
            'Codigo': 'Total General:',
            'Total': formattedTotal,
            'Fecha': '',
        };

        data.push(totalRow);

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'pedidos');
        XLSX.writeFile(wb, 'pedidos.xlsx');
    };


    const descargarPDF = () => {
        const pdf = new jsPDF('landscape'); // Orientación horizontal
        pdf.text('Lista de Pedidos', 10, 10);

        const columns = [
            { title: 'ID Pedido', dataKey: 'idPedido' },
            { title: 'Estado', dataKey: 'estado' },
            { title: 'Nombre', dataKey: 'nombre' },
            { title: 'Email', dataKey: 'email' },
            { title: 'Telfono', dataKey: 'telefono' },
            { title: 'Pago', dataKey: 'pago' },
            { title: 'Entrega', dataKey: 'entrega' },
            { title: 'Nota', dataKey: 'nota' },
            { title: 'Productos', dataKey: 'productos' },
            { title: 'Codigo', dataKey: 'codigo' },
            { title: 'Total', dataKey: 'total' },
            { title: 'Fecha', dataKey: 'createdAt' },
        ];

        let totalGeneral = 0;

        const data = filtrados.map(item => {
            const total = parseFloat(item.total); // Convertir a número
            totalGeneral += total;
            const productos = JSON.parse(item.productos);
            const infoProductos = productos.map(producto => `${producto.titulo} - ${moneda}${producto.precio} - x${producto.cantidad}  `);
            return {
                idPedido: item.idPedido,
                estado: item.estado,
                nombre: item.nombre,
                email: item.email,
                telefono: item.telefono,
                pago: item.pago,
                entrega: item.entrega,
                nota: item.nota,
                productos: infoProductos.join('\n'),
                codigo: item.codigo,
                total: `${moneda} ${total.toFixed(2)}`,
                createdAt: item.createdAt,
            };
        });

        // Formatear el total general
        const formattedTotal = `${moneda} ${totalGeneral.toFixed(2)}`;

        // Agregar fila con el total general
        const totalRow = {
            idPedido: '',
            estado: '',
            nombre: '',
            email: '',
            telefono: '',
            pago: '',
            entrega: '',
            nota: '',
            productos: '',
            codigo: 'Total General:',
            total: formattedTotal,
            createdAt: '',
        };

        data.push(totalRow);

        pdf.autoTable({
            head: [columns.map(col => col.title)],
            body: data.map(item => Object.values(item)),
        });

        pdf.save('pedidos.pdf');
    };
    const handleDownloadPDF = () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        let y = 10;

        // Agregar título
        pdf.setFontSize(10);


        // Obtener los detalles del pedido actualmente mostrado en el modal
        const pedidoActual = pedido;


        // Agregar detalles del pedido al PDF
        const pedidoData = [
            [`ID Pedido:`, `${pedidoActual.idPedido}`],
            [`Estado:`, `${pedidoActual.estado}`],
            [`Nombre:`, `${pedidoActual.nombre}`],
            [`Email:`, `${pedidoActual.email}`],
            [`Telefono:`, `${pedidoActual.telefono}`],
            [`Pago:`, `${pedidoActual.pago}`],
            [`Entrega:`, `${pedidoActual.entrega}`],
            [`Nota:`, `${pedidoActual.nota}`],
            [`Código:`, `${pedidoActual.codigo}`],
            [`Total:`, `${moneda} ${pedidoActual.total}`],
            [`Fecha:`, `${pedidoActual.createdAt}`]
        ];
        pdf.autoTable({
            startY: y,
            head: [['Detalle del pedido', 'Valor']],
            body: pedidoData,
        });
        y = pdf.autoTableEndPosY() + 5;

        y += 5;

        // Obtener los productos del pedido actual
        const productosPedido = JSON.parse(pedidoActual.productos);

        // Generar sección de productos con imágenes y contenido
        for (let i = 0; i < productosPedido.length; i++) {
            if (y + 30 > pdf.internal.pageSize.getHeight()) {
                pdf.addPage();
                y = 10;
            }

            const producto = productosPedido[i];

            pdf.setFontSize(8);

            // Muestra la imagen a la izquierda de los datos del producto
            if (producto.imagen) {
                pdf.addImage(producto.imagen, 'JPEG', 15, y, 20, 20); // Ajusta el tamaño de la imagen aquí
            } else {
                // Si no hay URL de imagen, simplemente dejar un espacio en blanco
                pdf.text("Imagen no disponible", 5, y + 15);
            }

            if (producto) {
                pdf.text(`Producto: ${producto.titulo}`, 39, y + 3);
                pdf.text(`Precio: ${moneda} ${producto.precio}`, 39, y + 11);
                pdf.text(`Cantidad: ${producto.cantidad}`, 39, y + 15);
                pdf.text(`${producto.item}`, 39, y + 19);
            }

            y += 25; // Incrementar y para la siguiente posición
        }

        // Guardar el PDF
        pdf.save('pedido.pdf');
    };

    const resumenEstados = filtrados.reduce(
        (acc, item) => {
            const estado = item?.estado || '';
            if (estado === 'Pendiente') acc.pendientes += 1;
            if (estado === 'Pagado') acc.pagados += 1;
            if (estado === 'Entregado') acc.entregados += 1;
            if (estado === 'Rechazado') acc.rechazados += 1;
            return acc;
        },
        { pendientes: 0, pagados: 0, entregados: 0, rechazados: 0 }
    );

    const getEstadoClass = (estado) => {
        const estadoNormalizado = (estado || '').toLowerCase();
        if (estadoNormalizado === 'pendiente') return 'estadoBadge pendiente';
        if (estadoNormalizado === 'entregado') return 'estadoBadge entregado';
        if (estadoNormalizado === 'rechazado') return 'estadoBadge rechazado';
        if (estadoNormalizado === 'pagado') return 'estadoBadge pagado';
        return 'estadoBadge';
    };


    return (
        <section className='pedidosAdmin'>

            <ToastContainer />
            <div className='pedidosAdmin__header'>
                <div>
                    <span className='pedidosAdmin__badge'>
                        <FontAwesomeIcon icon={faReceipt} />
                        Gestión de pedidos
                    </span>
                    <h1>Pedidos</h1>
                    <p>Administra estados, revisa detalles y exporta resultados en segundos.</p>
                </div>

                <div className='pedidosAdmin__topbar'>
                    <div className='statCard'>
                        <span>Total</span>
                        <strong>{filtrados.length}</strong>
                    </div>
                    <div className='statCard'>
                        <span>Pendientes</span>
                        <strong>{resumenEstados.pendientes}</strong>
                    </div>
                    <div className='statCard'>
                        <span>Pagados</span>
                        <strong>{resumenEstados.pagados}</strong>
                    </div>
                </div>
            </div>

            <div className='deFlexContent'>

                <div className='deFlex2'>

                    <button className='excel' onClick={descargarExcel}><FontAwesomeIcon icon={faArrowDown} /> Excel</button>
                    <button className='pdf' onClick={descargarPDF}><FontAwesomeIcon icon={faArrowDown} /> PDF</button>
                </div>
                <div className='filtrosContain'>
                    <div className='inputsColumn'>
                        <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} placeholder='Desde' />
                    </div>
                    <div className='inputsColumn'>
                        <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} placeholder='Hasta' />
                    </div>

                    <div className='inputsColumn'>
                        <input type="number" value={filtroId} onChange={(e) => setFiltroId(e.target.value)} placeholder='Id Pedido' />
                    </div>

                    <div className='inputsColumn'>
                        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Estado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Rechazado">Rechazado</option>
                            <option value="Pagado">Pagado</option>
                            <option value="Pendiente">Pendiente</option>
                        </select>
                    </div>
                    <button className='reload' onClick={recargarProductos}><FontAwesomeIcon icon={faSync} /></button>
                    <button className='reverse' onClick={invertirOrden}>
                        {ordenInvertido ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
                    </button>

                </div>

            </div>

            <div className='table-container pedidosTableWrap'>
                <div className='tableHeaderLite'>
                    <h3>Tabla de pedidos</h3>
                    <p>Consulta, filtra y actualiza el estado de cada pedido.</p>
                </div>

                <table className='table'>
                    <thead>
                        <tr>
                            <th>Id Pedido</th>
                            <th>Estado</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th>Entrega</th>
                            <th>Pago</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.map(item => (
                            <tr key={item.idPedido}>
                                <td>{item.idPedido}</td>

                                <td>
                                    <span className={getEstadoClass(item?.estado)}>{item?.estado}</span>
                                </td>
                                <td>{item.nombre}</td>
                                <td>{item.email}</td>
                                <td>{item.telefono}</td>
                                <td>{item.entrega}</td>
                                <td>{item.pago}</td>
                                <td style={{ color: '#008000', }}>{moneda} {item.total}</td>
                                <td>{item.createdAt}</td>
                                <td>

                                    <button className='eliminar' onClick={() => eliminar(item.idPedido)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button className='editar' onClick={() => abrirModal(item)}>

                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filtrados.length === 0 && (
                            <tr>
                                <td colSpan='10' className='emptyTableCell'>
                                    No hay pedidos con los filtros actuales.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

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
                                    Pedido
                                </button>
                                <button type='button' onClick={handleDownloadPDF} className='texto'>Descargar PDF</button>
                            </div>

                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>ID Pedido</legend>
                                    <input
                                        value={pedido.idPedido}
                                        disabled

                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Nombre</legend>
                                    <input
                                        value={pedido.nombre}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Email</legend>
                                    <input
                                        value={pedido.email}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Telefono</legend>
                                    <input
                                        value={pedido.telefono}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Pago</legend>
                                    <input
                                        value={pedido.pago}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Entrega</legend>
                                    <input
                                        value={pedido.entrega}
                                        disabled

                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Codigo</legend>
                                    <input
                                        value={pedido.codigo}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Nota</legend>
                                    <input
                                        value={pedido.nota}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Fecha </legend>
                                    <input
                                        value={pedido.createdAt}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Total </legend>
                                    <input
                                        value={pedido.total}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Estado</legend>
                                    <select
                                        value={nuevoEstado !== '' ? nuevoEstado : pedido.estado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <option value={pedido.estado}>{pedido.estado}</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Rechazado">Rechazado</option>
                                        <option value="Pagado">Pagado</option>
                                    </select>
                                </fieldset>

                            </div>
                            <div className='cardsProductData'>
                                {JSON.parse(pedido.productos).map(producto => (
                                    <div key={producto.titulo} className='cardProductData'>
                                        <img src={producto.imagen} alt="imagen" />
                                        <div className='cardProductDataText'>
                                            <h3>{producto.titulo}</h3>
                                            <strong>{moneda} {producto.precio} <span>x{producto.cantidad}</span></strong>
                                            <span>{producto.item}</span>

                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type='button' className='btnPost' onClick={() => handleUpdateText(pedido.idPedido)} >Guardar </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
