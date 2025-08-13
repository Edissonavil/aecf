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
    // Archivos AUT existentes (solo datos) y nuevos (Files[])
    existingAutFiles: [],      // [{ url, name }]
    newAutFiles: [],           // File[]
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

        // Fotos existentes
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
        setFormData(prev => ({
          ...prev,
          nombre: d.nombre || '',
          descripcionProd: d.descripcionProd || '',
          precioIndividual: d.precioIndividual ?? '',
          existingPhotos,
          newPhotos: [],
          existingAutFiles,
          newAutFiles: [],
        }));
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


  // Nuevas fotos (múltiples, acumulativas)
  const handleNewPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData(prev => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...files],
    }));
    // limpias el input para permitir volver a seleccionar los mismos nombres si se desea
    e.target.value = '';
  };

  // Quitar una nueva foto antes de enviar
  const removeNewPhoto = (idx) => {
    setFormData(prev => {
      const next = [...prev.newPhotos];
      next.splice(idx, 1);
      return { ...prev, newPhotos: next };
    });
  };

  // Eliminar una foto existente (solo de la UI; el backend lo infiere por lo que queda)
  const removeExistingPhoto = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter(p => p.id !== idToRemove),
    }));
    toast.info("Foto eliminada de la selección.");
  };

  // Nuevos archivos AUT (múltiples, acumulativos)
  const handleNewAutFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData(prev => ({
      ...prev,
      newAutFiles: [...prev.newAutFiles, ...files],
    }));
    // reset para permitir re-selección
    e.target.value = '';
  };

  // Eliminar un archivo AUT existente (de la UI)
  const removeExistingAut = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingAutFiles: prev.existingAutFiles.filter(f => f.url !== urlToRemove),
    }));
    toast.info("Archivo eliminado de la selección.");
  };

  // Eliminar un archivo AUT nuevo antes de enviar
  const removeNewAutFile = (idx) => {
    setFormData(prev => {
      const next = [...prev.newAutFiles];
      next.splice(idx, 1);
      return { ...prev, newAutFiles: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Construir el DTO que el backend espera en @RequestPart("dto")
    const dto = {
      idProducto: product?.idProducto,
      nombre: formData.nombre,
      descripcionProd: formData.descripcionProd,
      precioIndividual: Number(formData.precioIndividual),
      // Mantén datos que no editas para no perderlos
      pais: product?.pais ?? null,
      categorias: product?.categorias ?? [],
      especialidades: product?.especialidades ?? [],
      // No necesarios para update, pero no estorban:
      estado: product?.estado ?? null,
      uploaderUsername: product?.uploaderUsername ?? null,
      usuarioDecision: product?.usuarioDecision ?? null,
      comentario: product?.comentario ?? null
    };

    const dataToSend = new FormData();
    dataToSend.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
 

    // Fotos: conservar las que quedaron y subir nuevas
    const keepFotoIds = formData.existingPhotos.map(p => p.id);
    dataToSend.append('keepFotoIds', JSON.stringify(keepFotoIds));
    formData.newPhotos.forEach(f => dataToSend.append('fotos', f));

    // Archivos AUT: conservar los que quedaron y subir nuevos
    const autKeepUrls = formData.existingAutFiles.map(f => f.url);
    dataToSend.append('autKeepUrls', JSON.stringify(autKeepUrls));
    formData.newAutFiles.forEach(f => dataToSend.append('archivosAut', f));

    try {
      await productApi.updateProduct(id, dataToSend);
      toast.success("Producto actualizado exitosamente!");
      navigate('/mis-productos');
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
          <Link to="/mis-productos" className="btn btn-primary">Volver a Mis Productos</Link>
        </div>
      </div>
    );
  }

  const fmtSize = (bytes) => {
    if (bytes == null) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

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
          <label htmlFor="fotos" className="form-label">Agregar fotos nuevas (múltiples)</label>
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

        {/* Agregar nuevos archivos AUT (múltiples, lista previa con quitar) */}
        <div className="mb-3">
          <label htmlFor="archivosAut" className="form-label">Agregar archivos del producto (múltiples)</label>
          <input
            type="file"
            className="form-control"
            id="archivosAut"
            name="archivosAut"
            multiple
            onChange={handleNewAutFilesChange}
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
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
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
