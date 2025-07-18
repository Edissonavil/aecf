import React, { useContext, useEffect, useState } from 'react';
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

  const [downloadReady, setDownloadReady] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PAYPAL');
  const [receiptFile, setReceiptFile] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptUploadError, setReceiptUploadError] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(null);

  const currency = 'USD';

  // 1) Carga inicial y última orden
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

        if (!cart.items?.length) {
          const resp = await axios.get(
            'http://localhost:8085/api/orders/my-orders/latest',
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (resp.data.downloadUrl) {
            setCompletedOrderId(resp.data.orderId);
            setDownloadReady(true);
          }
        }
      } catch (e) {
        setError('Error al inicializar carrito');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, role, accessToken]);

  // 2) Enriquecer con datos de producto
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
    } finally {
      setLoading(false);
    }
  };

  const total = itemsWithDetails
    .reduce((sum, i) => sum + (i.precioIndividual || 0) * i.quantity, 0)
    .toFixed(2);

  // 4) Crear orden manual
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
      setCartItems([]);
      await refreshCartCount();
      alert(`Orden creada (ID ${data.id}). Ahora sube tu comprobante.`);
    } catch {
      setError('No se pudo crear la orden.');
    } finally {
      setLoading(false);
    }
  };

  // 5) Subir comprobante
  const handleReceiptUpload = async () => {
    if (!currentOrderId || !receiptFile) return alert('Orden o archivo inválido.');
    setIsUploadingReceipt(true);
    setReceiptUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', receiptFile);
      await uploadReceiptForOrder(currentOrderId, fd);
      setUploadSuccessMessage('Comprobante subido. Pendiente aprobación.');
      setReceiptFile(null);
      setCurrentOrderId(null);
    } catch {
      setReceiptUploadError('Error subiendo el comprobante.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // 6) Descargar PayPal
  const handlePaymentSuccess = async orderID => {
    alert(`Pago exitoso! ID: ${orderID}`);
    setCompletedOrderId(orderID);
    setDownloadReady(true);
    setCartItems([]);
    await refreshCartCount();
  };

  if (loading) return <p>Cargando carrito…</p>;
  if (error)   return <p className="text-danger">{error}</p>;

  return (
    <div className="container my-5">
      <h2>Tu Carrito</h2>

      {itemsWithDetails.length === 0 && !currentOrderId && !uploadSuccessMessage && !downloadReady && (
        <p>No tienes productos.</p>
      )}

      {!currentOrderId && !uploadSuccessMessage && itemsWithDetails.map(item => (
        <CartCard
          key={item.productId}
          item={item}
          quantity={item.quantity}
          onRemove={() => handleRemove(item.productId)}
        />
      ))}

      {uploadSuccessMessage && <div className="alert alert-success">{uploadSuccessMessage}</div>}

      <div className="d-flex justify-content-between align-items-start mt-4">
        <h4>Total: {currency} {total}</h4>

        {!downloadReady && !currentOrderId && !uploadSuccessMessage && (
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
                    'http://localhost:8085/api/orders',
                    { currency, totalAmount: +total, items: itemsReq },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                  );
                  return data.orderId;
                }}
                onApprove={async data => {
                  await axios.post(
                    `http://localhost:8085/api/orders/${data.orderID}/capture`,
                    {},
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                  );
                  handlePaymentSuccess(data.orderID);
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

        {currentOrderId && !downloadReady && (
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
          </div>
        )}

        {downloadReady && (
          <button
            className="btn btn-success"
            onClick={async () => {
              const resp = await fetch(
                `http://localhost:8085/api/orders/${completedOrderId}/download`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              const blob = await resp.blob();
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a');
              a.href     = url;
              a.download = `pedido-${completedOrderId}.zip`;
              a.click();
              URL.revokeObjectURL(url);
              setDownloadReady(false);
              await refreshCartCount();
            }}
          >
            Descargar archivos del pedido
          </button>
        )}
      </div>
    </div>
  );
}
