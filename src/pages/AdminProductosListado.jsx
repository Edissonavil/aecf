import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProductsByStatus, getAllProducts } from '../services/productApi';

// Mapea estado a clase de badge para estilos visuales
const statusToBadge = {
  PENDIENTE: 'warning text-dark',
  APROBADO: 'success',
  RECHAZADO: 'danger',
};

const AdminProductosListado = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(''); // Para la barra de búsqueda por nombre/colaborador
  const [filterStatus, setFilterStatus] = useState('TODOS'); // Para el filtro por estado

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);

    let apiCall;
    apiCall = filterStatus === 'TODOS'
      ? getAllProducts()
      : getProductsByStatus(filterStatus);


    apiCall
      .then(res => {
        const items = Array.isArray(res.data.content)
          ? res.data.content
          : [];
        setProductos(items);
      })
      .catch(err => {
        console.error(`Error cargando productos con estado ${filterStatus}:`, err);
        setError(err); // Guarda el error para mostrarlo en la UI
      })
      .finally(() => setLoading(false)); // Siempre termina el estado de carga
  }, [filterStatus]); // `fetchProducts` depende de `filterStatus`, por lo que se recarga si este cambia
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // La dependencia es la función `fetchProducts` (estable por `useCallback`)
  const filtered = useMemo(() => {
    if (!query) return productos; // Si no hay búsqueda, devuelve todos los productos
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      p.uploaderUsername?.toLowerCase().includes(query.toLowerCase())
    );
  }, [productos, query]); // Dependencias: `productos` y `query`

  if (loading) return <p className="text-center py-4">Cargando…</p>;
  if (error) return <p className="text-danger text-center">Error al cargar datos. {error.message}</p>;

  return (
    <div className="container my-4">
      <h1 className="h4 mb-3">Administración de Productos</h1>

      <div className="row gy-2 gx-3 align-items-center mb-3">
        <div className="col-sm-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o colaborador"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="col-sm-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="TODOS">Todos los productos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADO">Aprobados</option>
            <option value="RECHAZADO">Rechazados</option>
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-primary" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th style={{ width: '5rem' }}>ID</th>
              <th>Nombre</th>
              <th>Creador</th>
              <th style={{ width: '8rem' }}>Estado</th>
              <th style={{ width: '6rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">No se encontraron productos con el filtro actual.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.idProducto}>
                  <td>#{p.idProducto}</td>
                  <td>{p.nombre}</td>
                  <td>{p.uploaderUsername}</td>
                  <td>
                    <span className={`badge bg-${statusToBadge[p.estado]}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <Link
                      // ¡RUTA CRUCIAL! Asegúrate de que coincida exactamente con la ruta de App.js para el detalle
                      to={`/admin/revisar-productos/${p.idProducto}`}
                      className="btn btn-sm btn-primary"
                    >Ver</Link>
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

export default AdminProductosListado;

