// src/pages/ColaboradorEditarProducto.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as productApi from '../services/productApi';
import { toast } from 'react-toastify';

const ColaboradorEditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcionProd: '',
    precioIndividual: '',
    // archivos a subir
    foto: null,
    archivosAut: null,
    // actuales (solo visualización)
    fotografiaProdActual: '',            // SIEMPRE string (url) o ''
    archivosAutActuales: [],             // [{ url, name }]
    // flags de mantener actuales
    keepFotografiaProd: true,
    keepArchivosAut: true,
  });

  useEffect(() => {
    setLoading(true);
    productApi.getProductById(id)
      .then(res => {
        const d = res.data;
        // Tomar PRIMERA foto disponible como URL (si hay varias)
        const firstFotoUrl = Array.isArray(d.fotografiaUrl)
          ? (d.fotografiaUrl[0] || '')
          : (typeof d.fotografiaUrl === 'string' ? d.fotografiaUrl : '');

        // Si no vino fotografiaUrl, construir desde fotografiaProd (id de drive)
        const firstFotoId = Array.isArray(d.fotografiaProd)
          ? (d.fotografiaProd[0] || '')
          : (typeof d.fotografiaProd === 'string' ? d.fotografiaProd : '');

        const fotoUrlFallback = firstFotoId
          ? `https://gateway-production-129e.up.railway.app/api/files/${d.idProducto}/${firstFotoId}`
          : '';

        // Para archivos, usar SIEMPRE las URLs completas que ya da el backend
        const autUrls = Array.isArray(d.archivosAutUrls) ? d.archivosAutUrls : [];

        setProduct(d);
        setFormData({
          nombre: d.nombre || '',
          descripcionProd: d.descripcionProd || '',
          precioIndividual: d.precioIndividual ?? '',
          foto: null,
          archivosAut: null,

          fotografiaProdActual: firstFotoUrl || fotoUrlFallback || '',
          archivosAutActuales: autUrls.map(u => ({
            url: u,
            name: (typeof u === 'string' && u.split('/').pop()) || 'archivo'
          })),

          keepFotografiaProd: !!(firstFotoUrl || fotoUrlFallback),
          keepArchivosAut: autUrls.length > 0,
        });
      })
      .catch(err => {
        console.error("Error cargando producto para editar:", err);
        setError(err);
        toast.error("Error al cargar los datos del producto.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === 'archivosAut') {
      setFormData(prev => ({
        ...prev,
        archivosAut: files, // FileList
        // si el usuario sube nuevos, marcamos mantener actuales (se enviarán nuevos; si no quieres conservar, el usuario puede desmarcar luego)
        keepArchivosAut: files && files.length > 0 ? true : prev.keepArchivosAut
      }));
      return;
    }

    if (name === 'foto') {
      const file = files && files[0] ? files[0] : null;
      setFormData(prev => ({
        ...prev,
        foto: file,
        keepFotografiaProd: file ? true : prev.keepFotografiaProd,
        // solo para mostrar nombre si se sube nueva (la previa seguirá siendo la actual)
        // no tocamos fotografiaProdActual aquí
      }));
      return;
    }
  };

  // Quitar un archivo actual (marcar para eliminar: aquí solo quitamos de la UI; el backend decide)
  const handleRemoveAutFile = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      archivosAutActuales: prev.archivosAutActuales.filter(f => f.url !== urlToRemove),
      // si quitó todos y no sube nuevos, keepArchivosAut puede quedar en false si el usuario lo desea
    }));
    toast.info("Archivo marcado para eliminación.");
  };

  // Utilidad segura para nombres
  const getFileNameFromUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Armamos el FormData como venías usando (nombre, descripcion, precio…)
    // Si tu backend espera 'dto' como JSON, puedes cambiar a un Blob JSON.
    const dataToSend = new FormData();
    dataToSend.append('nombre', formData.nombre);
    dataToSend.append('descripcionProd', formData.descripcionProd);
    dataToSend.append('precioIndividual', formData.precioIndividual);

    // Foto: si suben nueva, la mandamos; si quieren eliminar la actual sin subir, enviamos marcador
    if (formData.foto) {
      dataToSend.append('foto', formData.foto);
    } else if (!formData.keepFotografiaProd && formData.fotografiaProdActual) {
      dataToSend.append('foto', 'DELETE'); // tu backend ya contemplaba este patrón
    }

    // Archivos nuevos
    if (formData.archivosAut && formData.archivosAut.length > 0) {
      for (let i = 0; i < formData.archivosAut.length; i++) {
        dataToSend.append('archivosAut', formData.archivosAut[i]);
      }
    } else {
      // Si el usuario desmarca mantener y además removió todos los actuales en UI, mandamos marker
      const quedanActuales = formData.archivosAutActuales.length > 0;
      if (!formData.keepArchivosAut && !quedanActuales) {
        dataToSend.append('archivosAut', 'DELETE_ALL');
      }
    }

    // Si quieres pasar al backend qué archivos actuales se conservarán,
    // puedes adjuntar la lista de URLs actuales que permanecen:
    // dataToSend.append('archivosAutKeep', JSON.stringify(formData.archivosAutActuales.map(f => f.url)));

    try {
      await productApi.updateProduct(id, dataToSend);
      toast.success("Producto actualizado exitosamente!");
      navigate('/colaborador/mis-productos');
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      toast.error("Error al actualizar el producto. " + (err.response?.data?.message || err.message));
    }
  };

  if (loading)     return <p className="text-center py-4">Cargando producto para editar…</p>;
  if (error)       return <p className="text-danger text-center">Error al cargar el producto. {error.message}</p>;
  if (!product)    return <p className="text-center py-4">Producto no encontrado.</p>;

  if (product.estado && product.estado !== 'PENDIENTE') {
    return (
      <div className="container my-4">
        <div className="alert alert-warning text-center" role="alert">
          Este producto está en estado "{product.estado}" y no puede ser modificado.
        </div>
        <div className="text-center">
          <Link to="/colaborador/mis-productos" className="btn btn-primary">Volver a Mis Productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h1 className="h4 mb-3">Editar Producto: {product.nombre}</h1>

      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white" encType="multipart/form-data">
        {/* Nombre */}
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre del Producto</label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Descripción */}
        <div className="mb-3">
          <label htmlFor="descripcionProd" className="form-label">Descripción</label>
          <textarea
            className="form-control"
            id="descripcionProd"
            name="descripcionProd"
            rows="4"
            value={formData.descripcionProd}
            onChange={handleChange}
            required
          />
        </div>

        {/* Precio */}
        <div className="mb-3">
          <label htmlFor="precioIndividual" className="form-label">Precio Individual</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            id="precioIndividual"
            name="precioIndividual"
            value={formData.precioIndividual}
            onChange={handleChange}
            required
          />
        </div>

        {/* Foto única */}
        <div className="mb-3">
          <label htmlFor="foto" className="form-label">Fotografía del Producto (opcional)</label>
          <input
            type="file"
            className="form-control"
            id="foto"
            name="foto"
            accept="image/*"
            onChange={handleFileChange}
          />

          {formData.fotografiaProdActual && (
            <div className="mt-2 d-flex align-items-center">
              <small className="form-text text-muted me-2">
                Actual:{' '}
                <a href={formData.fotografiaProdActual} target="_blank" rel="noopener noreferrer">
                  {getFileNameFromUrl(formData.fotografiaProdActual)}
                </a>
              </small>
              <img
                src={formData.fotografiaProdActual}
                alt="Vista previa actual"
                style={{ maxWidth: '80px', maxHeight: '80px', marginRight: '10px' }}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="form-check ms-auto">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="keepFotografiaProd"
                  name="keepFotografiaProd"
                  checked={formData.keepFotografiaProd}
                  onChange={handleChange}
                  disabled={!!formData.foto}
                />
                <label className="form-check-label" htmlFor="keepFotografiaProd">
                  Mantener archivo actual
                </label>
              </div>
            </div>
          )}

          {!formData.fotografiaProdActual && !formData.foto && (
            <small className="form-text text-muted">No hay fotografía de producto actual.</small>
          )}
        </div>

        {/* Archivos múltiples */}
        <div className="mb-3">
          <label htmlFor="archivosAut" className="form-label">Archivo(s) del Producto (varios, opcional)</label>
          <input
            type="file"
            className="form-control"
            id="archivosAut"
            name="archivosAut"
            multiple
            onChange={handleFileChange}
          />

          {formData.archivosAutActuales && formData.archivosAutActuales.length > 0 && (
            <div className="mt-2">
              <small className="form-text text-muted d-block mb-1">Archivos actuales:</small>
              <ul className="list-group list-group-flush">
                {formData.archivosAutActuales.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-1 ps-0">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveAutFile(file.url)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>

              <div className="form-check mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="keepArchivosAut"
                  name="keepArchivosAut"
                  checked={formData.keepArchivosAut}
                  onChange={handleChange}
                  disabled={!!(formData.archivosAut && formData.archivosAut.length > 0)}
                />
                <label className="form-check-label" htmlFor="keepArchivosAut">
                  Mantener archivos actuales (si no se suben nuevos)
                </label>
              </div>
            </div>
          )}

          {(!formData.archivosAutActuales || formData.archivosAutActuales.length === 0) &&
            (!formData.archivosAut || formData.archivosAut.length === 0) && (
              <small className="form-text text-muted">No hay archivos del producto actuales.</small>
            )}
        </div>

        <div className="d-flex justify-content-end mt-4">
          <Link to="/colaborador/mis-productos" className="btn btn-secondary me-2">Cancelar</Link>
          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
};

export default ColaboradorEditarProducto;
