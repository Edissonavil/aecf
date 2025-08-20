// src/pages/ProductDetailEdit.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { getProductById, updateProduct } from '../services/productApi';
import { AuthContext } from '../context/AuthContext';

export default function ProductDetailEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, username } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  // Campos editables
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState('');

  // Fotos existentes a mantener (IDs) y nuevas fotos a subir (File[])
  const [keepFotoIds, setKeepFotoIds] = useState([]);
  const [newFotos, setNewFotos] = useState([]);

  // Selección de imagen para vista previa grande
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imgWrapperRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });

  const selectImage = (i) => {
    setSelectedIndex(i);
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });
  };

  const onMouseMove = e => {
    if (!imgWrapperRef.current) return;
    const { left, top, width, height } = imgWrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transform: 'scale(1.5)', transformOrigin: `${x}% ${y}%` });
  };
  const onMouseLeave = () => setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductById(id)
      .then(res => {
        const data = res?.data;
        if (!data) {
          setError('No se encontraron datos del producto.');
          return;
        }
        setProduct(data);
        setEditNombre(data.nombre || '');
        setEditDescripcion(data.descripcionProd || '');
        setEditPrecio(data.precioIndividual ?? 0);
        setKeepFotoIds(Array.isArray(data.fotografiaProd) ? data.fotografiaProd : []);
        setSelectedIndex(0);
      })
      .catch(err => {
        console.error('Error al obtener el producto:', err);
        setError('No se pudo cargar el producto.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleKeepFoto = (fotoId) => {
    setKeepFotoIds(prev =>
      prev.includes(fotoId) ? prev.filter(id => id !== fotoId) : [...prev, fotoId]
    );
  };

  const onNewFotosChange = (e) => {
    setNewFotos(Array.from(e.target.files || []));
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('nombre', editNombre);
      fd.append('descripcionProd', editDescripcion); // respeta espacios/saltos; backend debe persistir como viene
      fd.append('precioIndividual', String(editPrecio).replace(',', '.'));

      // mantener fotos existentes por ID
      (keepFotoIds || []).forEach(id => fd.append('keepFotoIds', id));

      // subir nuevas fotos
      (newFotos || []).forEach(file => fd.append('fotos', file));

      await updateProduct(product.idProducto ?? id, fd);

      // refrescar datos
      const res = await getProductById(id);
      const updated = res?.data;
      setProduct(updated);
      setEditNombre(updated?.nombre || '');
      setEditDescripcion(updated?.descripcionProd || '');
      setEditPrecio(updated?.precioIndividual ?? 0);
      setKeepFotoIds(Array.isArray(updated?.fotografiaProd) ? updated.fotografiaProd : []);
      setNewFotos([]);

      // volver al detalle (ajusta la ruta si tu app usa otra)
      navigate(`/producto/${id}`);
    } catch (e) {
      console.error('Error al guardar cambios:', e);
      const msg = e?.response?.data?.message || e.message || 'No se pudo guardar los cambios.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const canEdit =
    isAuthenticated &&
    role === 'ROL_COLABORADOR' &&
    product?.estado === 'APROBADO' &&
    (!!username ? product?.uploaderUsername === username : true); // si no hay username en contexto, dejamos que el backend autorice

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="my-5">
        <Alert variant="info">Producto no encontrado.</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="shadow-sm overflow-hidden">
        <Card.Body className="p-4 p-md-5">
          <Row className="g-4">
            {/* Columna de imágenes con zoom y gestión de fotos */}
            <Col xs={12} md={6} lg={5} className="d-flex flex-column align-items-center">
              <div
                ref={imgWrapperRef}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="product-image-wrapper rounded position-relative"
                style={{ width: '100%', maxWidth: 520 }}
              >
                <img
                  src={(product?.fotografiaUrl && product.fotografiaUrl[selectedIndex]) || 'https://via.placeholder.com/450x350?text=Sin+Imagen'}
                  alt={product?.nombre || 'Product Image'}
                  className="product-detail-img"
                  style={{ width: '100%', height: 'auto', borderRadius: 8, ...zoomStyle }}
                  onError={e => { e.currentTarget.src = 'https://via.placeholder.com/450x350?text=Sin+Imagen'; }}
                />
              </div>

              {/* Miniaturas existentes */}
              {Array.isArray(product?.fotografiaUrl) && product.fotografiaUrl.length > 0 && (
                <div className="thumbs-strip mt-3 d-flex flex-wrap gap-2 justify-content-center">
                  {product.fotografiaUrl.map((url, i) => {
                    const fotoId = product.fotografiaProd?.[i];
                    const keep = keepFotoIds.includes(fotoId);
                    return (
                      <div key={i} className="text-center">
                        <button
                          type="button"
                          className={`thumb-btn ${i === selectedIndex ? 'active' : ''}`}
                          onClick={() => selectImage(i)}
                          title={`Imagen ${i + 1}`}
                          style={{ border: 'none', background: 'transparent' }}
                        >
                          <img
                            src={url}
                            alt={`Miniatura ${i + 1}`}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }}
                            onError={e => { e.currentTarget.src = 'https://via.placeholder.com/72x72?text=No+Img'; }}
                          />
                        </button>
                        {/* Checkbox mantener/quitar */}
                        <div className="form-check mt-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`keep-${i}`}
                            checked={keep}
                            onChange={() => toggleKeepFoto(fotoId)}
                          />
                          <label htmlFor={`keep-${i}`} className="form-check-label" style={{ fontSize: 12 }}>
                            Mantener
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nuevas fotos */}
              {canEdit && (
                <Form.Group className="mt-3 w-100">
                  <Form.Label>Agregar nuevas fotos</Form.Label>
                  <Form.Control type="file" multiple accept="image/*" onChange={onNewFotosChange} />
                  {newFotos.length > 0 && (
                    <small className="text-muted d-block mt-1">
                      {newFotos.length} archivo(s) seleccionado(s)
                    </small>
                  )}
                </Form.Group>
              )}
            </Col>

            {/* Columna de formulario de edición */}
            <Col xs={12} md={6} lg={7}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h1 className="fw-bold m-0">Editar ficha</h1>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" onClick={() => navigate(`/producto/${id}`)}>
                    Cancelar
                  </Button>
                  <Button variant="success" onClick={handleSave} disabled={!canEdit || saving}>
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>

              {!canEdit && (
                <Alert variant="warning" className="mb-4">
                  Solo puedes editar título, descripción, precio y fotografías de productos <strong>APROBADOS</strong> que te pertenecen.
                </Alert>
              )}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    onBlur={(e) => setEditDescripcion(e.target.value)} // no recortar espacios al enviar
                    disabled={!canEdit}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                  <Form.Text className="text-muted">
                    Se respetarán saltos de línea y espacios (pre-wrap).
                  </Form.Text>
                </Form.Group>

                {/* Información contextual (solo lectura) */}
                <div className="mt-4">
                  <div className="text-secondary">Creador: <strong className="text-dark">{product?.uploaderUsername || 'Desconocido'}</strong></div>
                  <div className="text-secondary">Estado: <strong className="text-dark">{product?.estado}</strong></div>
                  <div className="text-secondary">País: <strong className="text-dark">{product?.pais || '—'}</strong></div>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
