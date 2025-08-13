// src/components/ProductCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const FILE_SERVICE_BASE_URL = 'https://gateway-production-129e.up.railway.app/api/files';

export default function ProductCard({ product }) {
  const productName = product.nombre ?? product.title ?? 'Nombre Desconocido';
  const priceNum = Number(product.precioIndividual ?? product.price ?? 0);
  const productCountry = product.pais ?? '—';

  const productSpecialties =
    Array.isArray(product.especialidades) && product.especialidades.length
      ? product.especialidades.join(', ')
      : 'N/A';

  const productFiles =
    Array.isArray(product.formatos) && product.formatos.length
      ? product.formatos.join(', ')
      : '—';

  // --- Portada: solo la 1ra foto disponible ---
  let coverUrl = '/placeholder.png';

  if (Array.isArray(product.fotografiaUrl) && product.fotografiaUrl.length > 0) {
    coverUrl = product.fotografiaUrl[0];
  } else if (typeof product.fotografiaUrl === 'string' && product.fotografiaUrl.trim() !== '') {
    coverUrl = product.fotografiaUrl;
  } else if (Array.isArray(product.fotografiaProd) && product.fotografiaProd.length > 0) {
    // Construir desde driveId
    coverUrl = `${FILE_SERVICE_BASE_URL}/${product.idProducto}/${product.fotografiaProd[0]}`;
  }

  return (
    <div className="card h-100 shadow-sm border-0 product-card">
      {/* Imagen de portada */}
      <img
        src={coverUrl}
        className="card-img-top product-card-img"
        alt={productName}
        onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-2">{productName}</h5>

        <p className="text-muted mb-1">{productSpecialties}</p>

        <p className="text-muted mb-2">
          <strong>País:</strong> {productCountry}
        </p>

        <p className="product-price fw-bold mb-3">
          ${priceNum.toFixed(2)}
        </p>

        <p className="text-muted mb-3">
          <strong>Archivos:</strong> {productFiles}
        </p>

        <div className="mt-auto d-grid gap-2">
          <Link to={`/producto/${product.idProducto}`} className="btn btn-warning btn-sm">
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    idProducto: PropTypes.number.isRequired,
    nombre: PropTypes.string,
    title: PropTypes.string,
    precioIndividual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    especialidades: PropTypes.arrayOf(PropTypes.string),
    pais: PropTypes.string,
    fotografiaUrl: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    fotografiaProd: PropTypes.arrayOf(PropTypes.string),
    formatos: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};
