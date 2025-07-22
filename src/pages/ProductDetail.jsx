// src/pages/ProductDetail.jsx
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { getProductById } from '../services/productApi';
import { addToCart } from '../services/orderApi';
import { AuthContext } from '../context/AuthContext';
import '../styles/ProductDetail.css'; // We'll add some CSS here for image sizing/zoom

const FILE_SERVICE_BASE_URL = 'https://gateway-production-129e.up.railway.app/api/users/solicitud-creador'; 

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Zoom state and ref
  const imgWrapperRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({}); // Start with empty object for no initial transform

  // Get refreshCartCount from AuthContext
  const { refreshCartCount } = useContext(AuthContext);


  useEffect(() => {
    // Fetch product details when the component mounts or ID changes
    getProductById(id)
      .then(res => {
        // Ensure product.fotografiaProd is not null or undefined
        if (res.data && res.data.fotografiaProd) {
          setProduct(res.data);
        } else {
          // Handle cases where the product or its image might be missing
          setError('Product image not available or product data is incomplete.');
        }
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        setError('No se pudo cargar el producto. Es posible que no exista o que haya un problema con la conexión.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(id);
      await refreshCartCount();
      navigate('/cart');
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert('No se pudo añadir el producto al carrito. Por favor, inténtalo de nuevo.');
    }
  };

  // Helper to get file extension for badges
  const getExt = fn => {
    const parts = fn.split('.');
    return parts.length > 1 ? `.${parts.pop().toUpperCase()}` : ''; // Ensure uppercase for consistency
  };

  // Zoom logic
  const onMouseMove = e => {
    if (!imgWrapperRef.current) return;
    const { left, top, width, height } = imgWrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transform: 'scale(1.5)', transformOrigin: `${x}% ${y}%` });
  };
  const onMouseLeave = () => setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });

  // Render loading, error, or product details
  if (loading) return <Container className="text-center my-5"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner></Container>;
  if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
  // Fallback if product is null after loading (e.g., 404 from API but no explicit error set)
  if (!product) return <Container className="my-5"><Alert variant="info">Producto no encontrado.</Alert></Container>;


  return (
    <Container className="my-5">
      <Card className="shadow-sm overflow-hidden">
        <Card.Body className="p-4 p-md-5">
          <Row className="g-4">
            {/* Imagen con zoom */}
            <Col xs={12} md={6} lg={5} className="d-flex justify-content-center">
              <div
                ref={imgWrapperRef}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="product-image-wrapper rounded"
              >
                <img
                  src={`${FILE_SERVICE_BASE_URL}/${product.idProducto}/${product.fotografiaProd}`}
                  alt={product.nombre || 'Product Image'}
                  className="product-detail-img"
                  style={zoomStyle}
                  onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                />
              </div>
            </Col>

            {/* Detalle del producto */}
            <Col xs={12} md={6} lg={7}>
              <h1 className="fw-bold">{product.nombre}</h1>
              <p className="fs-3 fw-bold text-primary">${(product.precioIndividual || 0).toFixed(2)}</p> {/* Ensure price is a number */}
              <p className="text-secondary">Creador: {product.uploaderUsername || 'Desconocido'}</p>

              <div className="mt-3 d-flex flex-wrap gap-2">
                {(product.especialidades || []).map((s, i) => (
                  <Badge key={i} bg="secondary" className="px-3 py-1">{s}</Badge>
                ))}
              </div>

              <p className="text-secondary mt-2">
                País: <strong className="text-dark">{product.pais || 'Desconocido'}</strong>
              </p>

              <div className="mt-4 text-secondary product-description">
                {product.descripcionProd || 'No hay descripción disponible para este producto.'}
              </div>

              <div className="mt-5">
                <h3 className="fw-bold mb-3">Formatos de Archivos:</h3>
                <Row className="g-2">
                  {(product.archivosAut || []).map((fn, i) => (
                    <Col key={i} xs="auto">
                      <Badge bg="info" className="text-dark px-3 py-1 file-badge">
                        {getExt(fn)}
                      </Badge>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Conditional "Add to Cart" / Login Message */}
              <div className="mt-4">
                {isAuthenticated ? (
                  role === 'ROL_CLIENTE' ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="fw-bold w-100"
                      onClick={handleAddToCart}
                    >
                      Añadir al Carrito
                    </Button>
                  ) : (
                    <Alert variant="info" className="text-center">
                      Este producto no se puede añadir al carrito con su rol actual ({role}).
                    </Alert>
                  )
                ) : (
                  <Alert variant="warning" className="text-center">
                    Necesitas <a href="/login" className="alert-link">Iniciar Sesión</a> para añadir productos al carrito de compras.
                  </Alert>
                )}
                {/* Botón para volver al catálogo */}
                <Button
                  variant="outline-secondary" // Un estilo más discreto
                  size="sm" // ¡Más pequeño!
                  className="mt-3" // Mantener un pequeño margen superior
                  onClick={() => navigate('/catalog')}
                >
                  Volver al Catálogo
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}