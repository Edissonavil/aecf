import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { getProductById, updateProduct } from '../services/productApi';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const FILES_BASE = 'https://gateway-production-129e.up.railway.app/api/files';

export default function ProductDetailEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, username } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcionProd: '',
    precioIndividual: '',
    pais: '',
    categorias: [],
    especialidades: [],
    existingPhotos: [],
    newPhotos: [],
    existingAutFiles: [],
    newAutFiles: [],
  });

  const isApproved = product?.estado === 'APROBADO';
  const canEditAllFields = !isApproved;

  // Image Gallery & Zoom
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

  // Previews for new photos
  const newPhotoPreviews = useMemo(
    () => formData.newPhotos.map(f => URL.createObjectURL(f)),
    [formData.newPhotos]
  );
  
  const allImageUrls = useMemo(() => {
    const existingUrls = formData.existingPhotos.map(p => p.url);
    const newUrls = newPhotoPreviews;
    return [...existingUrls, ...newUrls];
  }, [formData.existingPhotos, newPhotoPreviews]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductById(id)
      .then(res => {
        const d = res.data;
        if (!d) {
          setError('No se encontraron datos del producto.');
          return;
        }

        // Existing Photos
        const ids = Array.isArray(d.fotografiaProd) ? d.fotografiaProd : [];
        const urls = Array.isArray(d.fotografiaUrl) ? d.fotografiaUrl : [];
        const existingPhotos = ids.map((driveId, idx) => {
          const url = urls[idx] || `${FILES_BASE}/${d.idProducto}/${driveId}`;
          return { id: driveId, url };
        });

        // Existing AUT Files
        const autUrls = Array.isArray(d.archivosAutUrls) ? d.archivosAutUrls : [];
        const existingAutFiles = autUrls.map(u => ({
          url: u,
          name: (typeof u === 'string' && u.split('/').pop()) || 'archivo'
        }));

        setProduct(d);
        setFormData(prev => ({
          ...prev,
          nombre: d.nombre || '',
          descripcionProd: d.descripcionProd || '',
          precioIndividual: d.precioIndividual ?? '',
          pais: d.pais || '',
          categorias: d.categorias || [],
          especialidades: d.especialidades || [],
          existingPhotos,
          newPhotos: [],
          existingAutFiles,
          newAutFiles: [],
        }));
      })
      .catch(err => {
        console.error("Error cargando producto para editar:", err);
        setError("Error al cargar los datos del producto.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData(prev => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...files],
    }));
    e.target.value = '';
  };
  
  const removeExistingPhoto = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter(p => p.id !== idToRemove),
    }));
    toast.info("Foto eliminada de la selección.");
  };

  const removeNewPhoto = (idx) => {
    setFormData(prev => {
      const next = [...prev.newPhotos];
      next.splice(idx, 1);
      return { ...prev, newPhotos: next };
    });
  };

  const handleNewAutFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData(prev => ({
      ...prev,
      newAutFiles: [...prev.newAutFiles, ...files],
    }));
    e.target.value = '';
  };

  const removeExistingAut = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingAutFiles: prev.existingAutFiles.filter(f => f.url !== urlToRemove),
    }));
    toast.info("Archivo eliminado de la selección.");
  };

  const removeNewAutFile = (idx) => {
    setFormData(prev => {
      const next = [...prev.newAutFiles];
      next.splice(idx, 1);
      return { ...prev, newAutFiles: next };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
  
    const dto = {
      idProducto: product?.idProducto,
      nombre: formData.nombre,
      descripcionProd: formData.descripcionProd,
      precioIndividual: Number(formData.precioIndividual),
      pais: canEditAllFields ? formData.pais : product.pais,
      categorias: canEditAllFields ? formData.categorias : product.categorias,
      especialidades: canEditAllFields ? formData.especialidades : product.especialidades,
    };
  
    const dataToSend = new FormData();
    dataToSend.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  
    const keepFotoIds = formData.existingPhotos.map(p => p.id);
    dataToSend.append('keepFotoIds', JSON.stringify(keepFotoIds));
    formData.newPhotos.forEach(f => dataToSend.append('fotos', f));
  
    if (!isApproved) {
      const autKeepUrls = formData.existingAutFiles.map(f => f.url);
      dataToSend.append('autKeepUrls', JSON.stringify(autKeepUrls));
      formData.newAutFiles.forEach(f => dataToSend.append('archivosAut', f));
    }
  
    try {
      await updateProduct(id, dataToSend);
      toast.success("Producto actualizado exitosamente!");
      navigate('/mis-productos');
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      toast.error("Error al actualizar el producto. " + (err.response?.data?.message || err.message));
    } finally {
      newPhotoPreviews.forEach(url => URL.revokeObjectURL(url));
      setIsSaving(false);
    }
  };
  
  const canEdit = isAuthenticated && role === 'ROL_COLABORADOR' && (!!username ? product?.uploaderUsername === username : true);

  const fmtSize = (bytes) => {
    if (bytes == null) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

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
  
  if (!canEdit) {
    return (
      <Container className="my-5">
        <Alert variant="danger">No tienes permiso para editar este producto.</Alert>
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
                  src={allImageUrls[selectedIndex] || 'https://via.placeholder.com/450x350?text=Sin+Imagen'}
                  alt={product?.nombre || 'Product Image'}
                  className="product-detail-img"
                  style={{ width: '100%', height: 'auto', borderRadius: 8, ...zoomStyle }}
                  onError={e => { e.currentTarget.src = 'https://via.placeholder.com/450x350?text=Sin+Imagen'; }}
                />
              </div>

              {/* Miniaturas existentes */}
              {allImageUrls.length > 0 && (
                <div className="thumbs-strip mt-3 d-flex flex-wrap gap-2 justify-content-center">
                  {formData.existingPhotos.map((p, i) => (
                    <div key={p.id} className="text-center">
                      <button
                        type="button"
                        className={`thumb-btn ${i === selectedIndex ? 'active' : ''}`}
                        onClick={() => selectImage(i)}
                        title={`Imagen ${i + 1}`}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <img
                          src={p.url}
                          alt={`Miniatura ${i + 1}`}
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }}
                          onError={e => { e.currentTarget.src = 'https://via.placeholder.com/72x72?text=No+Img'; }}
                        />
                      </button>
                      {/* Botón para eliminar foto existente */}
                      <div className="form-check mt-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeExistingPhoto(p.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  {newPhotoPreviews.map((src, i) => (
                    <div key={i} className="text-center">
                      <button
                        type="button"
                        className={`thumb-btn ${i + formData.existingPhotos.length === selectedIndex ? 'active' : ''}`}
                        onClick={() => selectImage(i + formData.existingPhotos.length)}
                        title={`Nueva Imagen ${i + 1}`}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <img
                          src={src}
                          alt={`Nueva ${i + 1}`}
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }}
                        />
                      </button>
                      {/* Botón para quitar nueva foto */}
                      <div className="form-check mt-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeNewPhoto(i)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nuevas fotos */}
              <Form.Group className="mt-3 w-100">
                <Form.Label>Agregar nuevas fotos</Form.Label>
                <Form.Control type="file" multiple accept="image/*" onChange={handleNewPhotosChange} />
                {formData.newPhotos.length > 0 && (
                  <small className="text-muted d-block mt-1">
                    {formData.newPhotos.length} archivo(s) seleccionado(s)
                  </small>
                )}
              </Form.Group>
            </Col>

            {/* Columna de formulario de edición */}
            <Col xs={12} md={6} lg={7}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h1 className="fw-bold m-0">Editar ficha</h1>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" onClick={() => navigate(`/producto/${id}`)}>
                    Cancelar
                  </Button>
                  <Button variant="success" onClick={handleSubmit} disabled={isSaving || loading}>
                    {isSaving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>

              {isApproved && (
                <Alert variant="info" className="mb-4">
                  Este producto está APROBADO. Solo puedes editar el título, descripción, precio y fotografías.
                </Alert>
              )}
              {!canEditAllFields && !isApproved && (
                <Alert variant="warning" className="mb-4">
                  Solo puedes editar título, descripción, precio y fotografías de productos <strong>APROBADOS</strong> que te pertenecen.
                </Alert>
              )}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleBasicChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="precioIndividual"
                    value={formData.precioIndividual}
                    onChange={handleBasicChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="descripcionProd"
                    value={formData.descripcionProd}
                    onChange={handleBasicChange}
                    required
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                  <Form.Text className="text-muted">
                    Se respetarán saltos de línea y espacios (pre-wrap).
                  </Form.Text>
                </Form.Group>

                {/* Archivos AUT (Deshabilitados si está APROBADO) */}
                <div className="mb-3">
                  <label className="form-label d-block">Archivos del producto actuales</label>
                  {isApproved && <small className="text-muted d-block mb-2">No se pueden modificar archivos en un producto aprobado.</small>}
                  {formData.existingAutFiles.length === 0 ? (
                    <small className="text-muted">No hay archivos actuales.</small>
                  ) : (
                    <ul className="list-group">
                      {formData.existingAutFiles.map((f) => (
                        <li key={f.url} className="list-group-item d-flex justify-content-between align-items-center">
                          <a href={f.url} target="_blank" rel="noopener noreferrer">{f.name}</a>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeExistingAut(f.url)}
                            disabled={isApproved}
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="archivosAut" className="form-label">Agregar archivos del producto (múltiples)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="archivosAut"
                    name="archivosAut"
                    multiple
                    onChange={handleNewAutFilesChange}
                    disabled={isApproved}
                  />
                  {formData.newAutFiles.length > 0 && (
                    <ul className="list-group mt-2">
                      {formData.newAutFiles.map((file, idx) => (
                        <li key={`${file.name}-${idx}`} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{file.name} <small className="text-muted">({fmtSize(file.size)})</small></span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeNewAutFile(idx)}
                            disabled={isSaving}
                          >
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
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