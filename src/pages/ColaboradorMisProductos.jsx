// src/pages/ColaboradorMisProductos.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as productApi from '../services/productApi';
import { toast } from 'react-toastify';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'; // Importa OverlayTrigger
import Tooltip from 'react-bootstrap/Tooltip';           // Importa Tooltip

const statusToBadge = {
  PENDIENTE: 'warning text-dark',
  APROBADO:  'success',
  RECHAZADO: 'danger',
};

const ColaboradorMisProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    productApi.getMyProducts()
      .then(res => {
        // Asegúrate de que res.data.content es un array. Si viene paginado, puede ser res.data.content
        const items = Array.isArray(res.data.content) ? res.data.content : [];
        setProductos(items);
      })
      .catch(err => {
        console.error("Error cargando mis productos:", err);
        setError(err);
        toast.error("Error al cargar tus productos.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await productApi.deleteProduct(id);
        toast.success(`Producto "${nombre}" eliminado exitosamente.`);
        fetchMyProducts();
      } catch (err) {
        console.error("Error eliminando producto:", err);
        const errorMessage = err.response?.data?.message || err.message || "Error desconocido al eliminar el producto.";
        toast.error(`Error al eliminar el producto: ${errorMessage}`);
      }
    }
  };

  if (loading) return <p className="text-center py-4">Cargando tus productos…</p>;
  if (error)   return <p className="text-danger text-center">Error al cargar tus productos. {error.message}</p>;

  return (
    <div className="container my-4">
      <h1 className="h4 mb-3">Mis Productos Subidos</h1>

      <div className="table-responsive shadow-sm">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th style={{ width: '5rem' }}>ID</th>
              <th>Nombre</th>
              <th style={{ width: '8rem' }}>Estado</th>
              {/* Nueva columna para Comentario */}
              <th>Comentario </th>
              <th style={{ width: '10rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (


<tr><td colSpan="5" className="text-center py-4">Aún no has subido ningún producto.</td></tr>            ) : (
              productos.map(p => (
                <tr key={p.idProducto}>
                  <td>#{p.idProducto}</td>
                  <td>{p.nombre}</td>
                  <td>
                    <span className={`badge bg-${statusToBadge[p.estado]}`}>
                      {p.estado}
                    </span>
                  </td>
                  {/* Celda para el Comentario del admin */}
                  <td>
                    {p.comentario ? (
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id={`tooltip-${p.idProducto}`}>{p.comentario}</Tooltip>}
                      >
                        <span className="text-muted text-decoration-underline" style={{ cursor: 'pointer' }}>
                          Ver comentario
                        </span>
                      </OverlayTrigger>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td>
                    <Link
                      to={`/editar-producto/${p.idProducto}`}
                      className="btn btn-sm btn-info me-2"
                    >Editar</Link>
                    <button
                     onClick={() => handleDelete(p.idProducto, p.nombre)}
                     className="btn btn-sm btn-danger"
                   >Eliminar</button>
                  </td>
                </tr>
              ))
            )}
            
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ColaboradorMisProductos;