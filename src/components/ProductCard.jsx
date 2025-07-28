// src/components/ProductCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // Para el enlace a los detalles

const FILE_SERVICE_BASE_URL = "https://gateway-production-129e.up.railway.app/api/files"; // Tu URL base para archivos

export default function ProductCard({ product }) {
  // Manejo de valores nulos/undefined para visualización
  const productName = product.nombre || product.title || 'Nombre Desconocido';
  const productPrice = product.precioIndividual || product.price || 0; // Usar 0 como fallback numérico
  const productCountry = product.pais || 'Desconocido';
  const productSpecialties = Array.isArray(product.especialidades) && product.especialidades.length > 0
    ? product.especialidades.join(', ')
    : 'N/A';

  const productFiles = Array.isArray(product.formatos) && product.formatos.length > 0
    ? product.formatos.join(', ')
    : '';


  // --- CORRECCIÓN AQUÍ: Determinar la URL de la imagen ---
  const imageUrl = product.fotografiaProd
    ? `${FILE_SERVICE_BASE_URL}/${product.idProducto}/${product.fotografiaProd}`
    : '/placeholder.png'; // Un placeholder si no hay foto

  return (
    <div className="card h-100 shadow-sm border-0 product-card">
      {/* Imagen */}
      <img
        src={imageUrl} // Usa la URL determinada
        className="card-img-top product-card-img"
        alt={productName}
        onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} // Ya lo tienes, es bueno
      />

      <div className="card-body d-flex flex-column">
        {/* Nombre de Producto */}
        <h5 className="card-title mb-2">{productName}</h5>

        {/* Especialidad */}
        <p className="text-muted mb-1">
          <strong></strong> {productSpecialties}
        </p>

        {/* País */}
        <p className="text-muted mb-2">
          <strong>País:</strong> {productCountry}
        </p>

        {/* Precio */}
        <p className="product-price fw-bold mb-3">
          ${productPrice.toFixed(2)}
        </p>

        {/* Tipo de archivos */}
        {productFiles && (
          <p className="text-muted mb-3">
            <strong>Archivos:</strong> {productFiles}
          </p>
        )}

        {/* Botones al final */}
        <div className="mt-auto d-grid gap-2">
          <Link to={`/producto/${product.idProducto}`}
            className="btn btn-warning btn-sm" >
            Ver Detalles </Link>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    idProducto: PropTypes.number.isRequired,
    nombre: PropTypes.string, // Puede ser 'nombre' o 'title'
    title: PropTypes.string,
    precioIndividual: PropTypes.number, // Puede ser 'precioIndividual' o 'price'
    price: PropTypes.number,
    especialidades: PropTypes.arrayOf(PropTypes.string),
    pais: PropTypes.string,
    fotografiaProd: PropTypes.string, // Ya no es isRequired porque puede ser null
    archivosAut: PropTypes.arrayOf(PropTypes.string),
    categorias: PropTypes.arrayOf(PropTypes.string), // Agregado si lo necesitas en el card
  }).isRequired,
};