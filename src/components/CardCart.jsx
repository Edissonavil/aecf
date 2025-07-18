// src/components/CardCart.jsx
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/CardCart.css'; // Asegúrate de tener las clases necesarias para el zoom

export default function CardCart({ item, onRemove }) {
  // Precio unificado
  const price = item.unitPrice ?? item.precioIndividual ?? 0;

  // Especialidades o guión si no vienen
  const specs = item.especialidades?.length
    ? item.especialidades.join(', ')
    : '—';

  // --- Lógica de zoom ---
  const imgWrapperRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({});

  const onMouseMove = e => {
    if (!imgWrapperRef.current) return;
    const { left, top, width, height } = imgWrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transform: 'scale(1.2)', transformOrigin: `${x}% ${y}%` });
  };

  const onMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });
  };

  // --- URL de la imagen: usa la que viene del backend ---
  const imageUrl = item.fotografiaUrl || '/placeholder.png';

  return (
    <div className="card mb-3 shadow-sm">
      <div className="row g-0 align-items-center">
        <div className="col-md-3">
          <div
            className="img-wrapper"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            ref={imgWrapperRef}
          >
            <img
              src={imageUrl}
              className="img-fluid rounded-start product-card-img-cart"
              alt={item.nombre || 'Producto'}
              style={zoomStyle}
              onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
            />
          </div>
        </div>
        <div className="col-md-9">
          <div className="card-body">
            <h5 className="card-title">{item.nombre}</h5>
            <p className="card-text">
              <small className="text-muted">Especialidad: {specs}</small>
            </p>
            <p className="card-text fw-bold">${price.toFixed(2)}</p>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRemove(item.productId)}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CardCart.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.number.isRequired,
    nombre: PropTypes.string,
    unitPrice: PropTypes.number,
    precioIndividual: PropTypes.number,
    especialidades: PropTypes.arrayOf(PropTypes.string),
    fotografiaUrl: PropTypes.string,        // ahora espera la URL completa
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};
