import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import baseURL from '../url';
import './Cart.css';
import whatsappIcon from '../../images/wpp.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
import Swal from 'sweetalert2';

const CART_STORAGE_KEY = 'cart';

export const getCartFromStorage = () => {
    try {
        const rawValue = localStorage.getItem(CART_STORAGE_KEY);
        const parsed = rawValue ? JSON.parse(rawValue) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error al leer el carrito desde localStorage:', error);
        return [];
    }
};

export const saveCartToStorage = (items) => {
    try {
        if (!items?.length) {
            localStorage.removeItem(CART_STORAGE_KEY);
            window.dispatchEvent(new Event('cart-updated'));
            return;
        }

        const normalized = items.map((item) => ({
            idProducto: item?.idProducto,
            cantidad: item?.cantidad || 1,
            item: item?.item || [],
        }));

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
        console.error('Error al guardar el carrito en localStorage:', error);
    }
};

export const calculateCartTotal = (items) => {
    return (items || []).reduce((total, item) => {
        const price = Number(item?.precio) || 0;
        const quantity = Number(item?.cantidad) || 0;
        return total + (price * quantity);
    }, 0);
};

const getProductImage = (item) => {
    return item?.imagen1 || item?.imagen2 || item?.imagen3 || item?.imagen4 || null;
};

const calculateBadgeCount = (items) => {
    return (items || []).reduce((total, item) => total + (Number(item?.cantidad) || 0), 0);
};

export default function Cart({ isOpen, onRequestClose, hideTrigger = false }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartBadgeCount, setCartBadgeCount] = useState(() => calculateBadgeCount(getCartFromStorage()));
    const [productsCatalog, setProductsCatalog] = useState([]);
    const [contactInfo, setContactInfo] = useState({});
    const [isCartLoading, setIsCartLoading] = useState(true);
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState('summary');

    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [deliveryOption, setDeliveryOption] = useState('delivery');
    const [submitMessage, setSubmitMessage] = useState('');

    const modalOpen = typeof isOpen === 'boolean' ? isOpen : internalIsOpen;

    const closeDrawer = useCallback(() => {
        if (onRequestClose) {
            onRequestClose();
        } else {
            setInternalIsOpen(false);
        }
        setCurrentStep('summary');
    }, [onRequestClose]);

    const openDrawer = () => {
        setInternalIsOpen(true);
        setCurrentStep('summary');
    };

    const loadProducts = useCallback(() => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                setProductsCatalog(data.productos || []);
            })
            .catch((error) => console.error('Error al cargar productos:', error));
    }, []);

    const loadContact = useCallback(() => {
        fetch(`${baseURL}/contactoGet.php`, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                setContactInfo(data?.contacto?.reverse()?.[0] || {});
            })
            .catch((error) => console.error('Error al cargar contactos:', error));
    }, []);

    const hydrateCartWithCatalog = useCallback((catalog) => {
        const storedCart = getCartFromStorage();
        setCartBadgeCount(calculateBadgeCount(storedCart));

        const mergedCart = storedCart
            .map((storedItem) => {
                const productData = catalog.find((product) => String(product.idProducto) === String(storedItem.idProducto));

                if (!productData && !storedItem?.titulo) {
                    return null;
                }

                return {
                    ...(productData || storedItem),
                    idProducto: productData?.idProducto || storedItem?.idProducto,
                    cantidad: Number(storedItem?.cantidad) || 1,
                    item: storedItem?.item || productData?.item || [],
                };
            })
            .filter(Boolean);

        setCartItems(mergedCart);
        setIsCartLoading(false);
    }, []);

    useEffect(() => {
        loadProducts();
        loadContact();
    }, [loadProducts, loadContact]);

    useEffect(() => {
        hydrateCartWithCatalog(productsCatalog);
    }, [productsCatalog, hydrateCartWithCatalog]);

    useEffect(() => {
        if (!modalOpen) {
            return;
        }

        setIsCartLoading(true);
        hydrateCartWithCatalog(productsCatalog);
    }, [modalOpen, productsCatalog, hydrateCartWithCatalog]);

    useEffect(() => {
        const syncCartFromStorage = () => {
            hydrateCartWithCatalog(productsCatalog);
        };

        const handleStorage = (event) => {
            if (event.key && event.key !== CART_STORAGE_KEY) {
                return;
            }
            syncCartFromStorage();
        };

        window.addEventListener('cart-updated', syncCartFromStorage);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('cart-updated', syncCartFromStorage);
            window.removeEventListener('storage', handleStorage);
        };
    }, [productsCatalog, hydrateCartWithCatalog]);

    const updateCartAndStorage = (updatedItems) => {
        setCartItems(updatedItems);
        setCartBadgeCount(calculateBadgeCount(updatedItems));
        saveCartToStorage(updatedItems);
    };

    const increaseQuantity = (targetIndex) => {
        const updated = cartItems.map((item, index) => {
            if (index !== targetIndex) {
                return item;
            }
            return {
                ...item,
                cantidad: (Number(item?.cantidad) || 1) + 1,
            };
        });
        updateCartAndStorage(updated);
    };

    const decreaseQuantity = (targetIndex) => {
        const updated = cartItems.map((item, index) => {
            if (index !== targetIndex) {
                return item;
            }
            return {
                ...item,
                cantidad: Math.max(1, (Number(item?.cantidad) || 1) - 1),
            };
        });
        updateCartAndStorage(updated);
    };

    const removeFromCart = (productId) => {
        const updated = cartItems.filter((item) => String(item?.idProducto) !== String(productId));
        updateCartAndStorage(updated);
    };

    const clearCart = () => {
        setCartItems([]);
        saveCartToStorage([]);
    };

    const subtotal = useMemo(() => calculateCartTotal(cartItems), [cartItems]);
    const finalTotal = useMemo(() => Math.max(0, subtotal), [subtotal]);

    const sendWhatsappMessage = () => {
        const phoneNumber = `${contactInfo?.telefono || ''}`.trim();
        if (!phoneNumber) {
            return;
        }

        const cartDetails = cartItems.map((item, index) => {
            const variants = Array.isArray(item?.item) && item.item.length > 0
                ? ` | Variantes: ${item.item.join(', ')}`
                : '';

            return `${index + 1}. ${item?.titulo || 'Producto'} x${item?.cantidad}${variants}`;
        });

        const deliveryText = deliveryOption === 'delivery'
            ? `Envío a domicilio\nDirección: ${deliveryAddress}`
            : 'Retiro personalmente';

        const paymentText = paymentMethod === 'efectivo'
            ? 'Efectivo'
            : 'Transferencia bancaria';

        const message = [
            'Hola, quisiera confirmar este pedido:',
            '',
            '*Productos*',
            ...cartDetails,
            '',
            '*Datos de contacto*',
            `Nombre: ${customerName}`,
            `Email: ${customerEmail}`,
            `Teléfono: ${customerPhone}`,
            `Entrega: ${deliveryText}`,
            `Pago: ${paymentText}`,
            orderNote.trim() ? `Nota: ${orderNote}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const resetOrderForm = () => {
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setDeliveryAddress('');
        setOrderNote('');
        setPaymentMethod('efectivo');
        setDeliveryOption('delivery');
    };

    const createOrder = async () => {
        if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
            Swal.fire('Datos incompletos', 'Nombre, email y teléfono son obligatorios.', 'warning');
            return;
        }

        if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
            Swal.fire('Dirección requerida', 'Ingresá la dirección para envío a domicilio.', 'warning');
            return;
        }

        if (cartItems.length === 0) {
            Swal.fire('Carrito vacío', 'Agregá productos antes de finalizar el pedido.', 'warning');
            return;
        }

        setSubmitMessage('Procesando...');

        try {
            const productsPayload = cartItems.map((item) => {
                const precio = Number(item?.precio) || 0;
                const cantidad = Number(item?.cantidad) || 0;
                return {
                    idProducto: item?.idProducto,
                    titulo: item?.titulo,
                    cantidad,
                    precio,
                    subtotal: Number((precio * cantidad).toFixed(2)),
                    item: item?.item,
                    imagen: getProductImage(item),
                };
            });
            const formData = new FormData();

            formData.append('productos', JSON.stringify(productsPayload));
            formData.append('total', Number(finalTotal).toFixed(2));
            formData.append('nombre', customerName);
            formData.append('email', customerEmail);
            formData.append('telefono', customerPhone);

            const entrega = deliveryOption === 'delivery' ? deliveryAddress : 'Retiro personalmente';
            formData.append('entrega', entrega);
            formData.append('pago', paymentMethod);
            formData.append('nota', orderNote);
            formData.append('codigo', '');
            formData.append('estado', 'Pendiente');

            const response = await fetch(`${baseURL}/pedidoPost.php`, {
                method: 'POST',
                body: formData,
            });

            // console.log('Payload pedido:', { productsPayload, total: Number(finalTotal).toFixed(2) });
            const rawText = await response.text();
            let data = null;

            try {
                data = JSON.parse(rawText);
            } catch (parseError) {
                throw new Error('La API devolvio una respuesta invalida.');
            }

            if (!response.ok) {
                throw new Error(data?.error || `Error HTTP ${response.status}`);
            }

            if (data?.mensaje) {
                setSubmitMessage('');
                Swal.fire(
                    'Pedido enviado!',
                    data.mensaje,
                    'success'
                );

                sendWhatsappMessage();
                clearCart();
                resetOrderForm();
                closeDrawer();
            } else if (data?.error) {
                setSubmitMessage('');
                Swal.fire(
                    'Error',
                    data?.error,
                    'error'
                );
            } else {
                setSubmitMessage('');
                Swal.fire(
                    'Error',
                    'No se recibio una respuesta valida del servidor.',
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmitMessage('');
            Swal.fire(
                'Error',
                error?.message || 'Error de conexión. Por favor, inténtelo de nuevo.',
                'error'
            );
        }
    };

    return (
        <div>
            {!hideTrigger && (
                <button
                    onClick={openDrawer}
                    className='cartIconFixed'
                    aria-label='Abrir carrito'
                >
                    {cartBadgeCount >= 1 && (
                        <span>{cartBadgeCount}</span>
                    )}
                    <FontAwesomeIcon icon={faShoppingCart} />
                </button>
            )}

            <Modal
                isOpen={modalOpen}
                className="cartDrawer"
                overlayClassName="cartDrawerOverlay"
                onRequestClose={closeDrawer}
            >
                <section className='cartDrawer__container'>
                    <header className='cartDrawer__header'>
                        <button
                            type='button'
                            className='cartDrawer__backButton'
                            onClick={() => {
                                if (currentStep === 'checkout') {
                                    setCurrentStep('summary');
                                    return;
                                }
                                closeDrawer();
                            }}
                            aria-label={currentStep === 'checkout' ? 'Volver al resumen' : 'Cerrar carrito'}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>

                        <div className='cartDrawer__titleWrap'>
                            <h2>Mi carrito</h2>
                            <p>{currentStep === 'summary' ? 'Paso 1: Resumen' : 'Paso 2: Finalizar pedido'}</p>
                        </div>

                        <button
                            type='button'
                            className='cartDrawer__clearButton'
                            onClick={clearCart}
                            disabled={cartItems.length === 0}
                        >
                            <FontAwesomeIcon icon={faTrash} /> Vaciar
                        </button>
                    </header>

                    <div className='cartDrawer__steps'>
                        <button
                            type='button'
                            className={`cartDrawer__stepButton ${currentStep === 'summary' ? 'is-active' : ''}`}
                            onClick={() => setCurrentStep('summary')}
                        >
                            Resumen
                        </button>
                        <button
                            type='button'
                            className={`cartDrawer__stepButton ${currentStep === 'checkout' ? 'is-active' : ''}`}
                            onClick={() => setCurrentStep('checkout')}
                            disabled={cartItems.length === 0}
                        >
                            Datos y envío
                        </button>
                    </div>

                    {isCartLoading ? (
                        <div className='cartDrawer__loading'>Cargando carrito...</div>
                    ) : currentStep === 'summary' ? (
                        <>
                            {cartItems.length === 0 ? (
                                <div className='cartDrawer__empty'>
                                    <img src={require('../../images/carrito.png')} alt='Carrito vacío' />
                                    <h3>No hay productos en tu carrito</h3>
                                    <button type='button' onClick={closeDrawer}>Continuar comprando</button>
                                </div>
                            ) : (
                                <>
                                    <div className='cartDrawer__list'>
                                        {cartItems.map((item, index) => {
                                            const variantsText = Array.isArray(item?.item)
                                                ? item.item.join(', ')
                                                : item?.item;

                                            return (
                                                <article key={`${item?.idProducto}-${index}`} className='cartDrawer__productCard'>
                                                    <Anchor
                                                        to={`/producto/${item?.idProducto}/${item?.titulo?.replace(/\s+/g, '-')}`}
                                                        onClick={closeDrawer}
                                                        className='cartDrawer__productImage'
                                                    >
                                                        <img src={getProductImage(item)} alt={item?.titulo || 'Producto'} />
                                                    </Anchor>

                                                    <div className='cartDrawer__productInfo'>
                                                        <h4>{item?.titulo}</h4>
                                                        {variantsText ? <p>{variantsText}</p> : null}
                                                    </div>

                                                    <div className='cartDrawer__productActions'>
                                                        <button
                                                            type='button'
                                                            className='cartDrawer__removeButton'
                                                            onClick={() => removeFromCart(item?.idProducto)}
                                                            aria-label='Eliminar producto'
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>

                                                        <div className='cartDrawer__qtyControl'>
                                                            <button type='button' onClick={() => decreaseQuantity(index)}>-</button>
                                                            <span>{item?.cantidad}</span>
                                                            <button type='button' onClick={() => increaseQuantity(index)}>+</button>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>

                                    <footer className='cartDrawer__summary'>
                                        <button type='button' className='cartDrawer__checkoutButton' onClick={() => setCurrentStep('checkout')}>
                                            Pedir por WhatsApp <img src={whatsappIcon} alt='WhatsApp' />
                                        </button>
                                    </footer>
                                </>
                            )}
                        </>
                    ) : (
                        <div className='cartDrawer__checkout'>
                            <div className='cartDrawer__section'>
                                <h4>Datos de contacto</h4>
                                <div className='cartDrawer__fieldGrid'>
                                    <input
                                        type='text'
                                        value={customerName}
                                        onChange={(event) => setCustomerName(event.target.value)}
                                        placeholder='Nombre (obligatorio)'
                                    />
                                    <input
                                        type='email'
                                        value={customerEmail}
                                        onChange={(event) => setCustomerEmail(event.target.value)}
                                        placeholder='Email (obligatorio)'
                                    />
                                    <input
                                        type='tel'
                                        value={customerPhone}
                                        onChange={(event) => setCustomerPhone(event.target.value)}
                                        placeholder='Teléfono (obligatorio)'
                                    />
                                </div>
                            </div>

                            <div className='cartDrawer__section'>
                                <h4>Entrega</h4>
                                <div className='cartDrawer__radioGroup'>
                                    <label>
                                        <input
                                            type='radio'
                                            name='deliveryOption'
                                            value='delivery'
                                            checked={deliveryOption === 'delivery'}
                                            onChange={() => setDeliveryOption('delivery')}
                                        />
                                        Envío a domicilio
                                    </label>
                                    <label>
                                        <input
                                            type='radio'
                                            name='deliveryOption'
                                            value='pickup'
                                            checked={deliveryOption === 'pickup'}
                                            onChange={() => setDeliveryOption('pickup')}
                                        />
                                        Retirar personalmente
                                    </label>
                                </div>

                                {deliveryOption === 'delivery' && (
                                    <input
                                        type='text'
                                        value={deliveryAddress}
                                        onChange={(event) => setDeliveryAddress(event.target.value)}
                                        placeholder='Dirección de entrega (obligatorio)'
                                    />
                                )}
                            </div>

                            <div className='cartDrawer__section'>
                                <h4>Pago</h4>
                                <div className='cartDrawer__radioGroup'>
                                    <label>
                                        <input
                                            type='radio'
                                            name='paymentMethod'
                                            value='efectivo'
                                            checked={paymentMethod === 'efectivo'}
                                            onChange={() => setPaymentMethod('efectivo')}
                                        />
                                        Efectivo
                                    </label>
                                    <label>
                                        <input
                                            type='radio'
                                            name='paymentMethod'
                                            value='transferencia'
                                            checked={paymentMethod === 'transferencia'}
                                            onChange={() => setPaymentMethod('transferencia')}
                                        />
                                        Transferencia
                                    </label>
                                </div>
                            </div>

                            <div className='cartDrawer__section'>
                                <h4>Nota</h4>
                                <textarea
                                    value={orderNote}
                                    onChange={(event) => setOrderNote(event.target.value)}
                                    placeholder='Nota adicional (opcional)'
                                />
                            </div>

                            {submitMessage ? (
                                <button type='button' className='cartDrawer__submitButton' disabled>
                                    {submitMessage}
                                </button>
                            ) : (
                                <button type='button' className='cartDrawer__submitButton' onClick={createOrder}>
                                    Finalizar pedido
                                </button>
                            )}

                            <p className='cartDrawer__helpText'>
                                Al finalizar, se registrará el pedido en el sistema y se abrirá WhatsApp con el detalle listo para enviar.
                            </p>
                        </div>
                    )}
                </section>
            </Modal>
        </div>
    );
}
