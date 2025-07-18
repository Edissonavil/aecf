import React, { useEffect, useState } from 'react';
import {
  getOrdersPendingReceiptReview,
  reviewManualPayment,
  downloadOrderBlob
} from '../services/orderApi';
import { Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import '../styles/ReviewPaymentsPage.css';

const FILE_SERVICE_BASE_URL = "http://localhost:8084/api/files";

export default function ReviewPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [comment, setComment] = useState('');

  // 1) Carga órdenes
  const fetchOrders = async (currentPage) => {
    setLoading(true);
    try {
      const response = await getOrdersPendingReceiptReview(currentPage);
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setError('No se pudieron cargar las órdenes pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  // 2) Aprobar/rechazar
  const handleReviewAction = async (approve) => {
    if (!selectedOrder) return;
    try {
      await reviewManualPayment(selectedOrder.id, approve, comment);
      alert(`Orden ${selectedOrder.id} ${approve ? 'aprobada' : 'rechazada'} con éxito.`);
      setShowModal(false);
      setComment('');
      fetchOrders(page);
    } catch (err) {
      console.error("Error al revisar pago:", err);
      alert('No se pudo procesar la revisión.');
    }
  };

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getFileType = (filename) => {
    if (!filename) return 'unknown';
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','bmp','webp','svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'document';
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="my-5">{error}</Alert>;
  if (orders.length === 0) return <Alert variant="info" className="my-5">No hay órdenes pendientes.</Alert>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Revisar Comprobantes de Pago</h2>

      {orders.map(order => (
        <div key={order.id} className="card mb-3 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">
              Orden ID: {order.id} ({order.orderId || 'N/A'})
            </h5>
            <p className="card-text">Total: ${order.total?.toFixed(2)}</p>
            {order.customerUsername && (
              <p className="card-text">
                Cliente: <strong>{order.customerFullName || order.customerUsername}</strong>
                {order.customerEmail && ` (${order.customerEmail})`}
              </p>
            )}
            <p className="card-text">
              Estado de Pago: <span className="badge bg-warning text-dark">{order.paymentStatus}</span>
            </p>

            {order.receiptFilename && (
              <div className="mb-3">
                <h6>Comprobante:</h6>
                <a
                  href={`${FILE_SERVICE_BASE_URL}/${order.id}/${order.receiptFilename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-info btn-sm me-2"
                >
                  Ver Comprobante
                </a>
                {getFileType(order.receiptFilename) === 'image' && (
                  <img
                    src={`${FILE_SERVICE_BASE_URL}/${order.id}/${order.receiptFilename}`}
                    alt="Comprobante"
                    style={{maxWidth:200, maxHeight:200, objectFit:'contain', border:'1px solid #ddd', marginTop:10}}
                    onError={e=>{e.currentTarget.src='/placeholder.png';}}
                  />
                )}
                {getFileType(order.receiptFilename) === 'pdf' && (
                  <p style={{marginTop:10}}>
                    <img src="/pdf-icon.png" alt="PDF" style={{width:32,marginRight:10}}/>
                    Documento PDF cargado. Haz clic en "Ver Comprobante".
                  </p>
                )}
                {getFileType(order.receiptFilename) === 'document' && (
                  <p style={{marginTop:10}}>
                    <img src="/document-icon.png" alt="Doc" style={{width:32,marginRight:10}}/>
                    Archivo cargado. Haz clic en "Ver Comprobante".
                  </p>
                )}
              </div>
            )}

            <Button variant="primary" onClick={() => openReviewModal(order)}>
              Revisar Pago
            </Button>

            {order.downloadUrl && (
              <Button
                variant="success"
                className="ms-2"
                onClick={async () => {
                  try {
                    const response = await downloadOrderBlob(order.downloadUrl);
                    const blob = new Blob([response.data], { type: 'application/zip' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pedido-${order.orderId}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } catch (e) {
                    console.error('Error descargando pedido:', e);
                    alert('No se pudo descargar el pedido.');
                  }
                }}
              >
                Descargar Pedido
              </Button>
            )}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Button onClick={() => setPage(page - 1)} disabled={page === 0} className="me-2">Anterior</Button>
          <span>Página {page + 1} de {totalPages}</span>
          <Button onClick={() => setPage(page + 1)} disabled={page + 1 === totalPages} className="ms-2">Siguiente</Button>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Revisar Pago para Orden {selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Deseas aprobar o rechazar este pago?</p>
          <Form.Group className="mb-3">
            <Form.Label>Comentario (opcional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger"  onClick={() => handleReviewAction(false)}>Rechazar Pago</Button>
          <Button variant="success" onClick={() => handleReviewAction(true)}>Aprobar Pago</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
