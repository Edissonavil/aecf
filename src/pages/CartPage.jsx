import React, { useContext, useEffect, useState, useCallback } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CartCard from '../components/CardCart';
import {
  getCart,
  removeFromCart,
  createManualOrder,
  uploadReceiptForOrder,
} from '../services/orderApi';
import { getProductById } from '../services/productApi';
import CodigoQRImage from '../assets/CodigoQR.png';

export default function CartPage() {
  const { isAuthenticated, role, accessToken, refreshCartCount } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [itemsWithDetails, setItemsWithDetails] = useState([]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PAYPAL');
  const [receiptFile, setReceiptFile] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptUploadError, setReceiptUploadError] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(null);

  const [lastRelevantOrder, setLastRelevantOrder] = useState(null);
  const [isAwaitingManualPaymentReview, setIsAwaitingManualPaymentReview] = useState(false);

  const currency = 'USD';

  const handlePaymentCompletion = useCallback(async (orderIdFromPayment) => {
    alert(`Pago exitoso! ID: ${orderIdFromPayment}`);
    try {
      const resp = await axios.get(
        `https://gateway-production-129e.up.railway.app/api/orders/${orderIdFromPayment}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setLastRelevantOrder(resp.data);
    } catch (e) {
      console.error("Error al obtener detalles de la orden después del pago:", e);
      setLastRelevantOrder(null);
    }
    // SOLO AQUÍ se limpia el carrito, una vez que el pago es exitoso
    setCartItems([]);
    await refreshCartCount(); // Actualiza el contador del carrito a 0
    setIsAwaitingManualPaymentReview(false); // No hay orden en revisión
    setUploadSuccessMessage(null); // Limpia cualquier mensaje de subida
    setCurrentOrderId(null); // Limpia cualquier referencia a orden en proceso
  }, [accessToken, setCartItems, refreshCartCount, setLastRelevantOrder, setIsAwaitingManualPaymentReview, setUploadSuccessMessage, setCurrentOrderId]);

  useEffect(() => {
    if (!isAuthenticated || role !== 'ROL_CLIENTE') {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data: cart } = await getCart();
        setCartItems(cart.items || []);

        // Siempre intenta obtener la última orden completada para el usuario
        try {
          const resp = await axios.get(
            'https://gateway-production-129e.up.railway.app/api/orders/my-orders/latest',
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const latestOrder = resp.data;

          // Si la última orden está PAGADA (o comprobante subido)
          // Y el carrito actualmente NO tiene items, entonces es la orden relevante
          if ((latestOrder.paymentStatus === 'PAID' || latestOrder.paymentStatus === 'PAID_PAYPAL') && (cart.items == null || cart.items.length === 0)) {
            setLastRelevantOrder(latestOrder);
            setIsAwaitingManualPaymentReview(false); // No está en revisión si ya está pagada
          } else if (latestOrder.paymentStatus === 'UPLOADED_RECEIPT' && (cart.items == null || cart.items.length === 0)) {
            // Si hay un comprobante subido, la orden está en revisión
            setLastRelevantOrder(latestOrder);
            setIsAwaitingManualPaymentReview(true);
          } else {
            // En cualquier otro caso (ej. carrito con items, pago rechazado, etc.),
            // no hay una "última orden relevante" para mostrar descarga/espera.
            setLastRelevantOrder(null);
            setIsAwaitingManualPaymentReview(false);
          }

        } catch (e) {
          // Esto se ejecutará si no hay órdenes completadas para el usuario (404)
          console.warn("No se encontró una última orden relevante o error al cargarla:", e);
          setLastRelevantOrder(null);
          setIsAwaitingManualPaymentReview(false);
        }

      } catch (e) {
        setError('Error al inicializar carrito');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, role, accessToken]); // Dependencias: solo cambia cuando el usuario o token cambian

  // ... (resto del useEffect para enriquecer con datos de producto - sin cambios)
  useEffect(() => {
    if (!cartItems.length) {
      setItemsWithDetails([]);
      return;
    }
    (async () => {
      const enriched = await Promise.all(
        cartItems.map(async item => {
          try {
            const resp = await getProductById(item.productId);
            return {
              ...item,
              nombre: resp.data.nombre,
              precioIndividual: resp.data.precioIndividual,
              fotografiaUrl: resp.data.fotografiaUrl,
            };
          } catch {
            return { ...item, nombre: 'Producto no disponible', precioIndividual: 0 };
          }
        })
      );
      setItemsWithDetails(enriched);
    })();
  }, [cartItems]);

  const handleRemove = async productId => {
    try {
      setLoading(true);
      await removeFromCart(productId);
      setCartItems(cs => cs.filter(i => i.productId !== productId));
      await refreshCartCount();
      // Si el carrito se vacía o se modifica, reinicia el estado de orden relevante
      setLastRelevantOrder(null);
      setIsAwaitingManualPaymentReview(false);
      setCurrentOrderId(null);
      setUploadSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const total = itemsWithDetails
    .reduce((sum, i) => sum + (i.precioIndividual || 0) * i.quantity, 0)
    .toFixed(2);

  const handleManualOrderCreation = async () => {
    if (!cartItems.length) return alert('Carrito vacío.');
    setLoading(true);
    setError(null);
    try {
      const itemsReq = itemsWithDetails.map(d => ({
        productId: d.productId,
        name: d.nombre,
        quantity: d.quantity,
        unitPrice: d.precioIndividual,
        sku: String(d.productId),
      }));
      const { data } = await createManualOrder({ currency, totalAmount: +total, items: itemsReq });
      setCurrentOrderId(data.id);
      setLastRelevantOrder(null);
      setIsAwaitingManualPaymentReview(false);
      await refreshCartCount();
      alert(`Orden creada (ID ${data.id}). Ahora sube tu comprobante.`);
    } catch {
      setError('No se pudo crear la orden.');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async () => {
    if (!currentOrderId || !receiptFile) return alert('Orden o archivo inválido.');
    setIsUploadingReceipt(true);
    setReceiptUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', receiptFile);
      const { data: updatedOrderDto } = await uploadReceiptForOrder(currentOrderId, fd);

      setUploadSuccessMessage('Comprobante subido. Pendiente aprobación.');
      setReceiptFile(null);
      setCurrentOrderId(null);

      setLastRelevantOrder(updatedOrderDto);
      setIsAwaitingManualPaymentReview(true);

    } catch (e) {
      console.error("Error al subir el comprobante:", e);
      setReceiptUploadError('Error subiendo el comprobante.');
      setLastRelevantOrder(null);
      setIsAwaitingManualPaymentReview(false);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // ... (useEffect para Polling - sin cambios, ya está bien)
  useEffect(() => {
    let intervalId;
    if (isAwaitingManualPaymentReview && lastRelevantOrder?.id) {
      intervalId = setInterval(async () => {
        try {
          const resp = await axios.get(
            `https://gateway-production-129e.up.railway.app/api/orders/${lastRelevantOrder.id}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const updatedOrder = resp.data;

          if (updatedOrder.paymentStatus === 'PAID' || updatedOrder.paymentStatus === 'PAID_PAYPAL') {
            handlePaymentCompletion(updatedOrder.id);
            clearInterval(intervalId);
          } else if (updatedOrder.paymentStatus === 'PAYMENT_REJECTED') {
            alert(`Tu pago para la orden #${updatedOrder.id} ha sido rechazado. Comentario: ${updatedOrder.adminComment || 'N/A'}`);
            setIsAwaitingManualPaymentReview(false);
            setLastRelevantOrder(null);
            setUploadSuccessMessage(null);
            clearInterval(intervalId);
          }
        } catch (e) {
          console.error("Error al refrescar estado de la orden en revisión:", e);
        }
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isAwaitingManualPaymentReview, lastRelevantOrder, accessToken, handlePaymentCompletion]);


  if (loading) return <p>Cargando carrito…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const hasDownloadUrl = lastRelevantOrder && lastRelevantOrder.downloadUrl;
  const showDownloadButton = hasDownloadUrl && cartItems.length === 0;
  const showCartAndPaymentOptions = itemsWithDetails.length > 0 && !currentOrderId && !isAwaitingManualPaymentReview && !hasDownloadUrl;
  const showUploadReceiptSection = currentOrderId && !isUploadingReceipt;
  const showInitialEmptyCartMessage = itemsWithDetails.length === 0 && !currentOrderId && !isAwaitingManualPaymentReview && !hasDownloadUrl;

  const downloadOrderId = lastRelevantOrder?.orderId; // Asegúrate de obtener el ID de la orden para el nombre del archivo

  return (
    <div className="container my-5">
      <h2>Tu Carrito</h2>

      {showInitialEmptyCartMessage && (
        <p>No tienes productos en tu carrito.</p>
      )}

      {/* Mostrar mensaje de espera si hay una orden manual en revisión */}
      {isAwaitingManualPaymentReview && lastRelevantOrder && (
        <div className="alert alert-info text-center">
          <p className="mb-0"><strong>¡Comprobante subido!</strong> Tu orden #{lastRelevantOrder.id} está pendiente de revisión por el administrador.</p>
          <small>Una vez que el pago sea aprobado, podrás descargar tus archivos aquí.</small>
          {lastRelevantOrder.adminComment && (
            <p className="mt-2 mb-0">Comentario del administrador: <em>"{lastRelevantOrder.adminComment}"</em></p>
          )}
        </div>
      )}

      {/* Mostrar mensaje de éxito de subida (momentáneo) */}
      {uploadSuccessMessage && !isAwaitingManualPaymentReview && (
        <div className="alert alert-success">{uploadSuccessMessage}</div>
      )}

      {/* Mostrar el contenido del carrito (items y total) si no estamos esperando aprobación o si no hay descarga lista */}
      {showCartAndPaymentOptions && itemsWithDetails.map(item => (
        <CartCard
          key={item.productId}
          item={item}
          quantity={item.quantity}
          onRemove={() => handleRemove(item.productId)}
        />
      ))}

      {showCartAndPaymentOptions && (
        <div className="d-flex justify-content-end align-items-center mt-4">
          <h4>Total: {currency} {total}</h4>
        </div>
      )}


      <div className="d-flex justify-content-between align-items-start mt-4">

        {/* Opciones de pago (PayPal o Manual) */}
        {showCartAndPaymentOptions && (
          <div className="w-50 d-flex flex-column gap-3">
            <select
              className="form-select"
              value={selectedPaymentMethod}
              onChange={e => setSelectedPaymentMethod(e.target.value)}
              disabled={!cartItems.length}
            >
              <option value="MANUAL_TRANSFER">Pagar con DeUna</option>
              <option value="PAYPAL">Pagar con PayPal</option>
            </select>

            {selectedPaymentMethod === 'PAYPAL' ? (

              <PayPalButtons
                createOrder={async () => {
                  const itemsReq = itemsWithDetails.map(d => ({
                    productId: d.productId,
                    name: d.nombre,
                    quantity: d.quantity,
                    unitPrice: d.precioIndividual,
                    sku: String(d.productId),
                  }));
                  const { data } = await axios.post(
                    'https://gateway-production-129e.up.railway.app/api/orders',
                    { currency, totalAmount: +total, items: itemsReq },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                  );
                  return data.orderId; // Retorna el orderId de PayPal para que el SDK lo use
                }}
                onApprove={async (data, actions) => {
                  try {
                    // 1. Confirma el pago en tu backend.
                    await axios.post(
                      `https://gateway-production-129e.up.railway.app/api/orders/${data.orderID}/capture`,
                      {},
                      { headers: { Authorization: `Bearer ${accessToken}` } }
                    );

                    // 2. Indica al SDK de PayPal que el proceso de frontend se completó y que cierre su ventana.
                    await actions.order.capture(); // <--- CAMBIO CLAVE: AWAIT AQUÍ Y ORDEN

                    // 3. Actualiza tu UI después de que PayPal haya finalizado su flujo.
                    handlePaymentCompletion(data.orderID); // No necesitas 'await' aquí si no quieres bloquear más,

                  } catch (error) {
                    console.error("Error durante la captura o post-procesamiento en el frontend:", error);
                    alert("Hubo un error al procesar tu pago. Por favor, contacta a soporte.");
                  }
                }}
                onCancel={(data) => {
                  console.log('Payment cancelled', data);
                  alert('El pago ha sido cancelado.');
                }}
                onError={(err) => {
                  console.error('Payment error', err);
                  alert('Ocurrió un error con el pago de PayPal. Por favor, inténtalo de nuevo.');
                }}
              />

            ) : (
              <div className="manual-transfer-section p-3 border rounded bg-light">
                <h5 className="mb-2">Datos de Transferencia Bancaria</h5>
                <p className="mb-1"><strong>Cuenta de Ahorros:</strong> Banco del Pichincha</p>
                <p className="mb-1"><strong>Cédula:</strong> 0106581119</p>
                <p className="mb-1"><strong>Nº Cuenta:</strong> 2204309931</p>
                <p className="mb-1"><strong>Beneficiario:</strong> Edisson Oswaldo Avila Redrovan</p>
                <p className="mb-3"><strong>Email:</strong> edissonavila33@gmail.com</p>

                <div className="text-center mb-3">
                  <img
                    src={CodigoQRImage}
                    alt="QR transferencia"
                    className="img-fluid border p-2"
                    style={{ maxWidth: 200 }}
                  />
                </div>

                <button
                  className="btn btn-primary d-block mx-auto"
                  onClick={handleManualOrderCreation}
                  disabled={!cartItems.length}
                >
                  Confirmar y Subir Comprobante
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sección de Subir Comprobante */}
        {showUploadReceiptSection && (
          <div className="p-3 border rounded bg-light w-50">
            <h5>Subir Comprobante (Orden #{currentOrderId})</h5>
            <input
              type="file"
              className="form-control my-2"
              onChange={e => setReceiptFile(e.target.files[0])}
            />
            <button
              className="btn btn-success me-2"
              onClick={handleReceiptUpload}
              disabled={!receiptFile || isUploadingReceipt}
            >
              {isUploadingReceipt ? 'Subiendo…' : 'Subir'}
            </button>
            {receiptUploadError && (
              <p className="text-danger mt-2">{receiptUploadError}</p>
            )}
            <p className="text-muted mt-2">Tu carrito permanecerá aquí hasta que el comprobante sea aprobado.</p>
          </div>
        )}

        {/* Botón de Descarga */}
        {showDownloadButton && (
          <button
            className="btn btn-success"
            onClick={async () => {
              try {
                // Realiza la petición al backend para iniciar la descarga
                const resp = await fetch(
                  lastRelevantOrder.downloadUrl,
                  { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                if (!resp.ok) {
                  console.error("Error al iniciar la descarga:", resp.status, resp.statusText);
                  alert("Error al intentar descargar los archivos. Intenta de nuevo.");
                  return; // No continúes si hay un error
                }

                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pedido-${downloadOrderId}.zip`;
                document.body.appendChild(a); // Es buena práctica añadirlo al DOM antes de click
                a.click();
                document.body.removeChild(a); // Limpiar después
                URL.revokeObjectURL(url);

                // 1. Limpia el estado local de la última orden relevante
                setLastRelevantOrder(null);
                await refreshCartCount();

              } catch (e) {
                console.error("Error en el proceso de descarga:", e);
                alert("Hubo un error al intentar descargar los archivos. Por favor, intenta de nuevo.");
              }
            }}
          >
            Descargar archivos del pedido
          </button>
        )}
      </div>
    </div>
  );
}