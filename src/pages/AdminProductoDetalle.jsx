import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, decideProduct } from '../services/productApi';
import '../styles/AdminProductoDetalle.css';

const badgeByStatus = {
  PENDIENTE: 'warning text-dark',
  APROBADO: 'success',
  RECHAZADO: 'danger',
};

// Ajusta si tienes otra base pública; se usa solo como fallback si no llega fotografiaUrl
const FILES_BASE_FALLBACK = 'https://gateway-production-129e.up.railway.app/api/files';

export default function AdminProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lensRef = useRef(null);

  const [prod, setProd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState('');
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getProductById(id)
      .then(res => { if (isMounted) setProd(res.data); })
      .catch(() => { if (isMounted) setProd(null); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [id]);

  // Derivar URLs de imágenes robustamente
  const imageUrls = (() => {
    if (!prod) return [];
    if (Array.isArray(prod.fotografiaUrl) && prod.fotografiaUrl.length > 0) return prod.fotografiaUrl;
    if (typeof prod.fotografiaUrl === 'string') return [prod.fotografiaUrl];
    if (Array.isArray(prod.fotografiaProd) && prod.fotografiaProd.length > 0) {
      // fallback: construir URLs desde los driveId
      return prod.fotografiaProd.map(driveId => `${FILES_BASE_FALLBACK}/${prod.idProducto}/${driveId}`);
    }
    return [];
  })();

  const primaryImageUrl = imageUrls[activeImgIdx] || '/placeholder.png';

  // Mantener el zoom lens sincronizado con la imagen activa
  useEffect(() => {
    if (lensRef.current) {
      lensRef.current.style.backgroundImage = `url(${primaryImageUrl})`;
    }
  }, [primaryImageUrl]);

  const moveLens = e => {
    const wrapper = e.currentTarget;
    const lens = lensRef.current;
    if (!lens) return;
    const rect = wrapper.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;
    x = Math.max(0, Math.min(1, x)) * 100;
    y = Math.max(0, Math.min(1, y)) * 100;
    lens.style.backgroundPosition = `${x}% ${y}%`;
  };

  const handleDecision = async aprobar => {
    try {
      await decideProduct(id, aprobar, comentario);
      alert('Decisión enviada correctamente.');
      navigate('/admin/revisar-productos', { replace: true });
    } catch {
      alert('No se pudo actualizar el estado.');
    }
  };

  if (loading) return <p className="apd__loading">Cargando…</p>;
  if (!prod) return <p className="apd__loading">Producto no encontrado.</p>;

  return (
    <main className="container apd__container">
      <h1 className="apd__title d-flex justify-content-between align-items-center">
        Revisión de producto
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin/revisar-productos')}
          type="button"
        >
          Cancelar
        </button>
      </h1>

      <div className="card shadow-sm apd__card">
        <div className="row g-0">
          {/* Columna de imagen + miniaturas */}
          <div className="col-lg-4 border-end">
            <div className="apd__cover-wrapper" onMouseMove={moveLens}>
              <img
                src={primaryImageUrl}
                alt={`Foto de ${prod.nombre}`}
                className="img-fluid apd__cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
              />
              <div
                ref={lensRef}
                className="apd__zoom-lens"
                style={{ backgroundImage: `url(${primaryImageUrl})` }}
              />
            </div>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="d-flex flex-wrap gap-2 p-3">
                {imageUrls.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setActiveImgIdx(i)}
                    className={`border-0 p-0 ${i === activeImgIdx ? 'apd__thumb--active' : ''}`}
                    style={{ background: 'transparent' }}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <img
                      src={url}
                      alt={`miniatura ${i + 1}`}
                      className="apd__thumb"
                      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna de detalles */}
          <div className="col-lg-8">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h2 className="card-title apd__name">{prod.nombre}</h2>
                <span className={`badge bg-${badgeByStatus[prod.estado]}`}>{prod.estado}</span>
              </div>

              <p className="text-muted apd__meta">
                ID: <strong>{prod.idProducto}</strong> · Creador: <strong>{prod.uploaderUsername}</strong>
              </p>

              <p className="apd__desc"><strong>Descripción:</strong><br />{prod.descripcionProd}</p>

              <div className="row apd__info">
                <div className="col-6 col-md-4">
                  <p className="mb-1"><strong>Precio:</strong></p>
                  <p className="mb-0">${Number(prod.precioIndividual || 0).toFixed(2)}</p>
                </div>
                <div className="mb-3"><strong>Categoría:</strong> {prod.categorias?.join(', ') || '—'}</div>
                <div className="mb-3"><strong>Especialidad:</strong> {prod.especialidades?.join(', ') || '—'}</div>
                <div className="col-6 col-md-4 mt-3">
                  <p className="mb-1"><strong>País:</strong></p>
                  <p className="mb-0">{prod.pais || '—'}</p>
                </div>
              </div>

              <hr />
              <h6 className="fw-semibold mb-2">Documentación:</h6>
              <ul className="list-unstyled apd__docs">
                {prod.archivosAutUrls && prod.archivosAutUrls.length > 0 ? (
                  prod.archivosAutUrls.map((fileUrl, i) => (
                    <li key={i} className="mb-1">
                      <a
                        href={fileUrl}
                        className="text-decoration-none apd__doc-link"
                        target="_blank" rel="noopener noreferrer"
                      >
                        <i className="bi bi-file-earmark-zip me-1" /> Archivo: {prod.archivosAut?.[i] || 'Descargar'}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>No hay archivos autorizados.</li>
                )}
              </ul>

              {/* Acciones */}
              {prod.estado === 'PENDIENTE' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Comentario (opcional)</label>
                    <textarea
                      className="form-control mb-3"
                      rows={2}
                      placeholder="Comentario opcional…"
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                    />
                  </div>
                  <div className="d-flex flex-wrap gap-2 apd__actions">
                    <button className="btn btn-success" onClick={() => handleDecision(true)}>
                      <i className="bi bi-check-lg me-1" /> Aprobar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDecision(false)}>
                      <i className="bi bi-x-lg me-1" /> Rechazar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary ms-auto"
                      onClick={() => navigate('/admin/revisar-productos')}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}

              {prod.estado !== 'PENDIENTE' && (
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin/revisar-productos')}
                  >
                    Volver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
