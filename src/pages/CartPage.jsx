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
import '../styles/CartPage.css';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { isAuthenticated, role, accessToken, refreshCartCount } = useContext(AuthContext);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [itemsWithDetails, setItemsWithDetails] = useState([]);
  const navigate = useNavigate();
  const goToCatalog = () => navigate('/catalog'); // ← ajusta la ruta si tu catálogo es otra (p.ej. '/products' o '/tienda')

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
        try {
          const resp = await axios.get(
            'https://gateway-production-129e.up.railway.app/api/orders/my-orders/latest',
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const latestOrder = resp.data;

          if ((latestOrder.paymentStatus === 'PAID' || latestOrder.paymentStatus === 'PAID_PAYPAL') && (cart.items == null || cart.items.length === 0)) {
            setLastRelevantOrder(latestOrder);
            setIsAwaitingManualPaymentReview(false);
          } else if (latestOrder.paymentStatus === 'UPLOADED_RECEIPT' && (cart.items == null || cart.items.length === 0)) {
            // Si hay un comprobante subido, la orden está en revisión
            setLastRelevantOrder(latestOrder);
            setIsAwaitingManualPaymentReview(true);
          } else {
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
  }, [isAuthenticated, role, accessToken]);

  // Enriquecer items del carrito con datos del producto
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

  // Polling para órdenes manuales en revisión
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
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAwaitingManualPaymentReview, lastRelevantOrder, accessToken, handlePaymentCompletion]);


  if (loading) return <div className="loading-state-cart">Cargando carrito…</div>;
  if (error) return <div className="error-state-cart">{error}</div>;

  // Variables de control para mostrar secciones
  const hasDownloadUrl = lastRelevantOrder && lastRelevantOrder.downloadUrl;
  const showUploadReceiptSection = currentOrderId && !isUploadingReceipt;
  const showInitialEmptyCartMessage = itemsWithDetails.length === 0 && !currentOrderId && !isAwaitingManualPaymentReview && !hasDownloadUrl;
  const showDownloadButton = lastRelevantOrder?.downloadUrl && (lastRelevantOrder.paymentStatus === 'PAID' || lastRelevantOrder.paymentStatus === 'PAID_PAYPAL');
  const showCartAndPaymentOptions = itemsWithDetails.length > 0 && !currentOrderId && !isAwaitingManualPaymentReview && !hasDownloadUrl;

  return (
    <div className="container cart-page-container">
      <div className="cart-header-bar">
        <h2 className="cart-title">Tu Carrito</h2>
        <button
          type="button"
          className="btn-add-products"
          onClick={goToCatalog}
        >
          Agregar más productos
        </button>
      </div>
      {/* Mensaje carrito vacío inicial */}
      {showInitialEmptyCartMessage && (
        <div className="cart-content-section">
          <p className="text-center text-muted mb-0">No tienes productos en tu carrito.</p>
        </div>
      )}

      {/* Mensaje de orden manual en revisión */}
      {isAwaitingManualPaymentReview && lastRelevantOrder && (
        <div className="cart-alert alert alert-info">
          <div className="text-center">
            <p className="mb-2">
              <strong>¡Comprobante subido!</strong> Tu orden #{lastRelevantOrder.id} está pendiente de revisión por el administrador.
            </p>
            <small className="d-block">Una vez que el pago sea aprobado, podrás descargar tus archivos aquí.</small>
            {lastRelevantOrder.adminComment && (
              <p className="mt-2 mb-0">
                <strong>Comentario del administrador:</strong> <em>"{lastRelevantOrder.adminComment}"</em>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de éxito temporal */}
      {uploadSuccessMessage && !isAwaitingManualPaymentReview && (
        <div className="cart-alert alert alert-success">
          {uploadSuccessMessage}
        </div>
      )}

      {/* Mostrar items del carrito */}
      {showCartAndPaymentOptions && (
        <div className="cart-content-section">
          {itemsWithDetails.map(item => (
            <CartCard
              key={item.productId}
              item={item}
              quantity={item.quantity}
              onRemove={() => handleRemove(item.productId)}
            />
          ))}
        </div>
      )}

      {/* Total del carrito */}
      {showCartAndPaymentOptions && (
        <div className="cart-total-section">
          <h4 className="cart-total-amount">Total: {currency} {total}</h4>
        </div>
      )}

      {/* Contenedor de opciones de pago y secciones relacionadas */}
      <div className="payment-options-container">

        {/* Opciones de pago (PayPal o Manual) */}
        {showCartAndPaymentOptions && (
          <div className="flex-fill">
            <div className="payment-method-selector">
              <select
                className="form-select"
                value={selectedPaymentMethod}
                onChange={e => setSelectedPaymentMethod(e.target.value)}
                disabled={!cartItems.length}
              >
                <option value="PAYPAL">Pagar con PayPal</option>
                <option value="MANUAL_TRANSFER">Pagar con DeUna</option>
              </select>
            </div>

            {selectedPaymentMethod === 'PAYPAL' ? (
              <div className="paypal-buttons-container">
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
                    return data.orderId;
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      await axios.post(
                        `https://gateway-production-129e.up.railway.app/api/orders/${data.orderID}/capture`,
                        {},
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                      );

                      await actions.order.capture();
                      handlePaymentCompletion(data.orderID);

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
              </div>

            ) : (
              <div className="manual-transfer-section">
                <h5>Datos de Transferencia Bancaria</h5>
                <div className="row">
                  <div className="col-md-8">
                    <p><strong>Cuenta de Ahorros:</strong> Banco del Pichincha</p>
                    <p><strong>Cédula:</strong> 0106581119</p>
                    <p><strong>Nº Cuenta:</strong> 2204309931</p>
                    <p><strong>Beneficiario:</strong> Edisson Oswaldo Avila Redrovan</p>
                    <p><strong>Email:</strong> edissonavila33@gmail.com</p>
                  </div>
                  <div className="col-md-4">
                    <div className="qr-code-container">
                      <img
                        src={CodigoQRImage}
                        alt="QR transferencia"
                        className="img-fluid"
                        style={{ maxWidth: 180 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    className="btn-cart-primary"
                    onClick={handleManualOrderCreation}
                    disabled={!cartItems.length}
                  >
                    Confirmar y Subir Comprobante
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección de Subir Comprobante */}
        {showUploadReceiptSection && (
          <div className="flex-fill">
            <div className="upload-receipt-section">
              <h5>Subir Comprobante (Orden #{currentOrderId})</h5>

              <input
                type="file"
                className="form-control"
                onChange={e => setReceiptFile(e.target.files[0])}
                accept=".jpg,.jpeg,.png,.pdf"
              />

              <div className="text-center">
                <button
                  className="btn-cart-success"
                  onClick={handleReceiptUpload}
                  disabled={!receiptFile || isUploadingReceipt}
                >
                  {isUploadingReceipt ? 'Subiendo…' : 'Subir Comprobante'}
                </button>
              </div>

              {receiptUploadError && (
                <div className="cart-alert alert alert-danger mt-3">
                  {receiptUploadError}
                </div>
              )}

              <p className="text-muted text-center mt-3 mb-0">
                <small>Tu carrito permanecerá aquí hasta que el comprobante sea aprobado.</small>
              </p>
            </div>
          </div>
        )}

        {/* Botón de Descarga - Destacado */}
        {showDownloadButton && (
          <div className="flex-fill text-center">
            <button
              className="btn btn-success"
              disabled={downloading}
              onClick={async () => {
                setDownloading(true);
                try {
                  const endpoint = `https://gateway-production-129e.up.railway.app/api/orders/${lastRelevantOrder.id}/zip`;
                  const resp = await fetch(endpoint, { headers: { Authorization: `Bearer ${accessToken}` } });
                  if (!resp.ok) {
                    const msg = await resp.text().catch(() => '');
                    console.error("Error al iniciar la descarga:", resp.status, msg);
                    alert("Error al intentar descargar los archivos. Intenta de nuevo.");
                    return;
                  }
                  const blob = await resp.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `pedido-${(lastRelevantOrder.orderId ?? lastRelevantOrder.id)}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setLastRelevantOrder(null);
                  await refreshCartCount();
                } catch (e) {
                  console.error(e);
                  alert('Error al descargar.');
                } finally {
                  setDownloading(false);
                }
              }}
            >
              {downloading ? 'Preparando…' : 'Descarga tus archivos Aquí'}
            </button>

            <p className="text-success text-center mt-3 mb-0">
              <small>✅ Tu orden está completa y lista para descargar</small>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}