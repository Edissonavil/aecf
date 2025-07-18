// src/pages/ColaboradorEditarProducto.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as productApi from '../services/productApi';
import { toast } from 'react-toastify';

const ColaboradorEditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcionProd: '', // <-- ¡CAMBIO AQUÍ! Ahora coincide con el backend
    precioIndividual: '',
    // Archivos para subir (File object para foto, FileList para archivosAut)
    foto: null,          
    archivosAut: null, 
    // Nombres de archivos actuales (URLs o nombres para mostrar)
    fotografiaProdActual: '',
    archivosAutActuales: [], 
    // Campos para controlar si se mantienen los archivos actuales (para eliminación sin reemplazo)
    keepFotografiaProd: true, 
    keepArchivosAut: true,     
  });

  useEffect(() => {
    setLoading(true);
    productApi.getProductById(id)
      .then(res => {
        console.log("Datos recibidos del producto:", res.data); 

        setProduct(res.data);
        setFormData({
          nombre: res.data.nombre || '',
          descripcionProd: res.data.descripcionProd || '', // <-- ¡CAMBIO AQUÍ! Extrae de descripcionProd
          precioIndividual: res.data.precioIndividual || '',
          foto: null,
          archivosAut: null, 
          fotografiaProdActual: res.data.fotografiaProd || '', 
          archivosAutActuales: res.data.archivosAut || [],         
          keepFotografiaProd: !!res.data.fotografiaProd, 
          keepArchivosAut: !!(res.data.archivosAut && res.data.archivosAut.length > 0), 
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
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'archivosAut') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: files, 
        keepArchivosAut: files.length > 0 ? true : prev.keepArchivosAut,
        archivosAutActuales: files.length > 0 ? Array.from(files).map(f => f.name) : prev.archivosAutActuales 
      }));
      return; 
    }

    if (name === 'foto') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null, 
        keepFotografiaProd: files[0] ? true : prev.keepFotografiaProd, 
        fotografiaProdActual: files[0] ? files[0].name : '' 
      }));
    }
  };

  const handleRemoveAutFile = (fileNameToRemove) => {
    setFormData(prev => {
      const updatedFiles = prev.archivosAutActuales.filter(name => name !== fileNameToRemove);
      return {
        ...prev,
        archivosAutActuales: updatedFiles,
      };
    });
    toast.info(`Archivo ${fileNameToRemove} marcado para eliminación.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();

    dataToSend.append('nombre', formData.nombre);
    dataToSend.append('descripcionProd', formData.descripcionProd); // <-- ¡CAMBIO AQUÍ!
    dataToSend.append('precioIndividual', formData.precioIndividual);

    if (formData.foto) { 
      dataToSend.append('foto', formData.foto);
    } else if (!formData.keepFotografiaProd && formData.fotografiaProdActual) { 
      dataToSend.append('foto', 'DELETE'); 
    }
    
    if (formData.archivosAut && formData.archivosAut.length > 0) {
      for (let i = 0; i < formData.archivosAut.length; i++) {
        dataToSend.append('archivosAut', formData.archivosAut[i]); 
      }
    } else if (!formData.keepArchivosAut && formData.archivosAutActuales.length > 0) {
      dataToSend.append('archivosAut', 'DELETE_ALL'); 
    }
    // Si se quiere mantener algunos y no se suben nuevos, la lógica para enviar 
    // `archivosAutToKeep` (JSON.stringify(formData.archivosAutActuales)) sería aquí.
    // Esto requiere que el backend también reciba y procese ese campo.

    try {
      await productApi.updateProduct(id, dataToSend); 
      toast.success("Producto actualizado exitosamente!");
      navigate('/colaborador/mis-productos');
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      toast.error("Error al actualizar el producto. " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p className="text-center py-4">Cargando producto para editar…</p>;
  if (error)   return <p className="text-danger text-center">Error al cargar el producto. {error.message}</p>;
  if (!product) return <p className="text-center py-4">Producto no encontrado.</p>;

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

  const BASE_FILES_URL = "http://localhost:8083/api/files/"; 

  return (
    <div className="container my-4">
      <h1 className="h4 mb-3">Editar Producto: {product.nombre}</h1>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white" encType="multipart/form-data">
        {/* Nombre del Producto */}
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
          <label htmlFor="descripcionProd" className="form-label">Descripción</label> {/* <-- ¡CAMBIO AQUÍ! */}
          <textarea
            className="form-control"
            id="descripcionProd" // <-- ¡CAMBIO AQUÍ!
            name="descripcionProd" // <-- ¡CAMBIO AQUÍ!
            rows="4"
            value={formData.descripcionProd} // <-- ¡CAMBIO AQUÍ!
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Precio Individual */}
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

        {/* Fotografía del Producto (Individual) */}
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
                Actual: <a href={`${BASE_FILES_URL}${formData.fotografiaProdActual}`} target="_blank" rel="noopener noreferrer">{formData.fotografiaProdActual}</a>
              </small>
              {/* Intentar mostrar la imagen si es una extensión de imagen */}
              {formData.fotografiaProdActual.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={`${BASE_FILES_URL}${formData.fotografiaProdActual}`} alt="Vista previa actual" style={{maxWidth: '80px', maxHeight: '80px', marginRight: '10px'}}/>
              ) : (
                <small className="form-text text-muted ms-2">Archivo no visualizable (no es imagen).</small>
              )}
              <div className="form-check ms-auto"> {/* ms-auto para moverlo a la derecha */}
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="keepFotografiaProd"
                  name="keepFotografiaProd"
                  checked={formData.keepFotografiaProd}
                  onChange={handleChange}
                  disabled={!!formData.foto} 
                />
                <label className="form-check-label" htmlFor="keepFotografiaProd">Mantener archivo actual</label>
              </div>
            </div>
          )}
          {!formData.fotografiaProdActual && !formData.foto && ( 
            <small className="form-text text-muted">No hay fotografía de producto actual.</small>
          )}
        </div>

        {/* Archivos de Autorización (Múltiples) */}
        <div className="mb-3">
          <label htmlFor="archivosAut" className="form-label">Archivos(s) del Producto (varios, opcional)</label> {/* <-- Texto ajustado */}
          <input
            type="file"
            className="form-control"
            id="archivosAut"
            name="archivosAut"
            multiple 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.gif" // Ajusta tipos MIME según necesites
          />
          {formData.archivosAutActuales && formData.archivosAutActuales.length > 0 && (
            <div className="mt-2">
              <small className="form-text text-muted d-block mb-1">Archivos actuales:</small>
              <ul className="list-group list-group-flush">
                {formData.archivosAutActuales.map((fileName, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-1 ps-0">
                    <a href={`${BASE_FILES_URL}${fileName}`} target="_blank" rel="noopener noreferrer">{fileName}</a>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleRemoveAutFile(fileName)}
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
                <label className="form-check-label" htmlFor="keepArchivosAut">Mantener archivos actuales (si no se suben nuevos)</label>
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