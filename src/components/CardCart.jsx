// src/components/CardCart.jsx
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/CardCart.css'; 

const FILE_SERVICE_BASE_URL = 'https://gateway-production-129e.up.railway.app/api/files';


export default function CardCart({ item, onRemove }) {
  // Precio unificado
  const price = item.unitPrice ?? item.precioIndividual ?? 0;

  const specs = item.especialidades?.length
    ? item.especialidades.join(', ')
    : '—';

  // --- Lógica de zoom ---
  const imgWrapperRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({});
  
  // Mueve el lente de zoom según la posición del mouse
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

  let imageUrl = '/placeholder.png';
  if (Array.isArray(item.fotografiaUrl) && item.fotografiaUrl.length > 0) {
    imageUrl = item.fotografiaUrl[0];
  } else if (typeof item.fotografiaUrl === 'string' && item.fotografiaUrl.trim() !== '') {
    imageUrl = item.fotografiaUrl;
  } else if (Array.isArray(item.fotografiaProd) && item.fotografiaProd.length > 0) {
    // Usa productId del item para armar la ruta pública
    const pid = item.productId ?? item.idProducto;
    if (pid) {
      imageUrl = `${FILE_SERVICE_BASE_URL}/${pid}/${item.fotografiaProd[0]}`;
    }
  }
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
              alt={item?.nombre || 'Producto'}
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
    fotografiaUrl: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    fotografiaProd: PropTypes.arrayOf(PropTypes.string),  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};
