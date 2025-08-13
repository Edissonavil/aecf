// src/pages/ColaboradorEditarProducto.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as productApi from '../services/productApi';
import { toast } from 'react-toastify';

const FILES_BASE = 'https://gateway-production-129e.up.railway.app/api/files';

const ColaboradorEditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcionProd: '',
    precioIndividual: '',
    // Fotos existentes (solo datos) y nuevas (File[])
    existingPhotos: [],        // [{ id, url }]
    newPhotos: [],             // File[]
    // Archivos AUT existentes (solo datos) y nuevos
    existingAutFiles: [],      // [{ url, name }]
    newAutFiles: null,         // FileList (múltiples)
  });

  // Previews para nuevas fotos
  const newPhotoPreviews = useMemo(
    () => formData.newPhotos.map(f => URL.createObjectURL(f)),
    [formData.newPhotos]
  );

  useEffect(() => {
    setLoading(true);
    productApi.getProductById(id)
      .then(res => {
        const d = res.data;

        // Fotos existentes: ids (fotografiaProd) + urls (fotografiaUrl)
        const ids  = Array.isArray(d.fotografiaProd) ? d.fotografiaProd : [];
        const urls = Array.isArray(d.fotografiaUrl)  ? d.fotografiaUrl  : [];

        const existingPhotos = ids.map((driveId, idx) => {
          const url = urls[idx] || `${FILES_BASE}/${d.idProducto}/${driveId}`;
          return { id: driveId, url };
        });

        // Archivos AUT existentes (usar URLs completas del backend)
        const autUrls = Array.isArray(d.archivosAutUrls) ? d.archivosAutUrls : [];
        const existingAutFiles = autUrls.map(u => ({
          url: u,
          name: (typeof u === 'string' && u.split('/').pop()) || 'archivo'
        }));

        setProduct(d);
        setFormData({
          nombre: d.nombre || '',
          descripcionProd: d.descripcionProd || '',
          precioIndividual: d.precioIndividual ?? '',
          existingPhotos,
          newPhotos: [],
          existingAutFiles,
          newAutFiles: null,
        });
      })
      .catch(err => {
        console.error("Error cargando producto para editar:", err);
        setError(err);
        toast.error("Error al cargar los datos del producto.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Nuevas fotos (múltiples)
  const handleNewPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData(prev => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...files],
    }));
  };

  // Quitar una nueva foto antes de enviar
  const removeNewPhoto = (idx) => {
    setFormData(prev => {
      const next = [...prev.newPhotos];
      next.splice(idx, 1);
      return { ...prev, newPhotos: next };
    });
  };

  // Eliminar definitivamente una foto existente (solo de la UI; el backend lo sabrá por lo que quede)
  const removeExistingPhoto = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter(p => p.id !== idToRemove),
    }));
    toast.info("Foto eliminada de la selección.");
  };

  // Nuevos archivos AUT
  const handleNewAutFilesChange = (e) => {
    const files = e.target.files; // FileList
    setFormData(prev => ({
      ...prev,
      newAutFiles: files && files.length > 0 ? files : null
    }));
  };

  // Eliminar definitivamente un archivo AUT existente (solo de la UI)
  const removeExistingAut = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingAutFiles: prev.existingAutFiles.filter(f => f.url !== urlToRemove),
    }));
    toast.info("Archivo eliminado de la selección.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    dataToSend.append('nombre', formData.nombre);
    dataToSend.append('descripcionProd', formData.descripcionProd);
    dataToSend.append('precioIndividual', formData.precioIndividual);

    // Fotos: lo que queda son las que se conservan
    const keepFotoIds = formData.existingPhotos.map(p => p.id);
    dataToSend.append('keepFotoIds', JSON.stringify(keepFotoIds));

    if (formData.newPhotos.length > 0) {
      formData.newPhotos.forEach(f => dataToSend.append('fotos', f));
    }

    // Archivos AUT: lo que queda son los que se conservan
    const autKeepUrls = formData.existingAutFiles.map(f => f.url);
    dataToSend.append('autKeepUrls', JSON.stringify(autKeepUrls));

    if (formData.newAutFiles && formData.newAutFiles.length > 0) {
      for (let i = 0; i < formData.newAutFiles.length; i++) {
        dataToSend.append('archivosAut', formData.newAutFiles[i]);
      }
    }

    try {
      await productApi.updateProduct(id, dataToSend);
      toast.success("Producto actualizado exitosamente!");
      navigate('/colaborador/mis-productos');
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      toast.error("Error al actualizar el producto. " + (err.response?.data?.message || err.message));
    } finally {
      // liberar blobs de previews
      newPhotoPreviews.forEach(url => URL.revokeObjectURL(url));
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
            onChange={handleBasicChange}
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
            onChange={handleBasicChange}
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
            onChange={handleBasicChange}
            required
          />
        </div>

        {/* Fotos existentes */}
        <div className="mb-3">
          <label className="form-label d-block">Fotos existentes</label>
          {formData.existingPhotos.length === 0 ? (
            <small className="text-muted">No hay fotos actuales.</small>
          ) : (
            <div className="d-flex flex-wrap gap-3">
              {formData.existingPhotos.map((p) => (
                <div key={p.id} className="border rounded p-2" style={{ width: 160 }}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={p.url}
                      alt="Foto"
                      style={{ width: '100%', height: 100, objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  </a>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100 mt-2"
                    onClick={() => removeExistingPhoto(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agregar nuevas fotos */}
        <div className="mb-3">
          <label htmlFor="fotos" className="form-label">Agregar fotos nuevas</label>
          <input
            type="file"
            className="form-control"
            id="fotos"
            name="fotos"
            accept="image/*"
            multiple
            onChange={handleNewPhotosChange}
          />
          {formData.newPhotos.length > 0 && (
            <div className="d-flex flex-wrap gap-3 mt-2">
              {newPhotoPreviews.map((src, i) => (
                <div key={i} className="border rounded p-2" style={{ width: 160 }}>
                  <img
                    src={src}
                    alt={`Nueva ${i+1}`}
                    style={{ width: '100%', height: 100, objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100 mt-2"
                    onClick={() => removeNewPhoto(i)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Archivos AUT existentes */}
        <div className="mb-3">
          <label className="form-label d-block">Archivos del producto actuales</label>
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
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Agregar nuevos archivos AUT */}
        <div className="mb-3">
          <label htmlFor="archivosAut" className="form-label">Agregar archivos del producto</label>
          <input
            type="file"
            className="form-control"
            id="archivosAut"
            name="archivosAut"
            multiple
            onChange={handleNewAutFilesChange}
          />
          {formData.newAutFiles && formData.newAutFiles.length > 0 && (
            <small className="d-block text-muted mt-1">
              {formData.newAutFiles.length} archivo(s) listos para subir.
            </small>
          )}
        </div>

        <div className="d-flex justify-content-end mt-4">
          <Link to="/mis-productos" className="btn btn-secondary me-2">Cancelar</Link>
          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
};

export default ColaboradorEditarProducto;
