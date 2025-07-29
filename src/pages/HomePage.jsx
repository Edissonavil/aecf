// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getProductsByStatus } from '../services/productApi';
import ProductCard from '../components/ProductCard';
import '../styles/HomePage.css';

const HomePage = () => {
  const [allApprovedProducts, setAllApprovedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeCountryFilter, setActiveCountryFilter] = useState('all');
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('all');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProductsByStatus('APROBADO', 0, 100);
        const data = res.data.content;
        data.sort((a, b) =>
          new Date(b.createdAt || b.idProducto) - new Date(a.createdAt || a.idProducto)
        );
        setAllApprovedProducts(data);
        setDisplayedProducts(data);

        const cats = Array.from(new Set(data.flatMap(p => p.categorias || [])))
          .filter(Boolean)
          .sort();
        const coun = Array.from(new Set(data.map(p => p.pais).filter(Boolean))).sort();
        const specs = Array.from(new Set(data.flatMap(p => p.especialidades || []).filter(Boolean))).sort();

        setAvailableCategories(['Todos', ...cats]);
        setAvailableCountries(['Todos', ...coun.slice(0, 5)]);
        setAvailableSpecialties(['Todos', ...specs]);
      } catch (e) {
        console.error(e);
        setError('Error cargando productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = allApprovedProducts
      .filter(p =>
        (p.nombre || p.title || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .filter(p =>
        activeCategoryFilter === 'all' ||
        (p.categorias || []).includes(activeCategoryFilter)
      )
      .filter(p =>
        activeCountryFilter === 'all' ||
        p.pais === activeCountryFilter
      )
      .filter(p =>
        activeSpecialtyFilter === 'all' ||
        (p.especialidades || []).includes(activeSpecialtyFilter)
      );

    setDisplayedProducts(filtered);
  }, [
    searchTerm,
    activeCategoryFilter,
    activeCountryFilter,
    activeSpecialtyFilter,
    allApprovedProducts
  ]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="hero-section py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} lg={8}>
              <h1 className="hero-title text-center mb-3">
                Más de <span className="highlight-text">300 herramientas</span>
              </h1>
              <p className="hero-subtitle text-center mb-4">
                El marketplace hecho por y para Arquitectos, Ingenieros y Constructores.
                Sube tus recursos. Mejora tu flujo de trabajo. Comparte, soluciona, gana.
              </p>
              <div className="text-center">
                <Link to="/catalog" className="btn btn-primary btn-explore">
                  Explorar Catálogo
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Catalogo y Filtros */}
      <section id="catalogo" className="catalog-section py-5">
        <Container>
          <Row className="mb-4">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Buscar productos por palabra clave..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>

          {/* Filtros */}
          <Row className="mb-4 gx-2 gy-2">
            <Col xs="auto" className="d-flex align-items-center">
              <strong>País:</strong>
            </Col>
            {availableCountries.map(cn => (
              <Col xs="auto" key={cn}>
                <Button
                  size="sm"
                  variant={
                    activeCountryFilter === (cn === 'Todos' ? 'all' : cn)
                      ? 'primary'
                      : 'outline-secondary'
                  }
                  onClick={() =>
                    setActiveCountryFilter(cn === 'Todos' ? 'all' : cn)
                  }
                >
                  {cn}
                </Button>
              </Col>
            ))}

            <Col xs="auto" className="d-flex align-items-center">
              <strong>Categorías:</strong>
            </Col>
            {availableCategories.map(cat => {
              const value = cat === 'Todos' ? 'all' : cat;
              return (
                <Col xs="auto" key={cat}>
                  <Button
                    size="sm"
                    variant={
                      activeCategoryFilter === value
                        ? 'primary'
                        : 'outline-secondary'
                    }
                    onClick={() => setActiveCategoryFilter(value)}
                  >
                    {cat}
                  </Button>
                </Col>
              );
            })}

            <Col xs="auto" className="d-flex align-items-center">
              <strong>Especialidad:</strong>
            </Col>
            {availableSpecialties.map(sp => (
              <Col xs="auto" key={sp}>
                <Button
                  size="sm"
                  variant={
                    activeSpecialtyFilter === (sp === 'Todos' ? 'all' : sp)
                      ? 'primary'
                      : 'outline-secondary'
                  }
                  onClick={() =>
                    setActiveSpecialtyFilter(sp === 'Todos' ? 'all' : sp)
                  }
                >
                  {sp}
                </Button>
              </Col>
            ))}
          </Row>

          {/* Grid de Productos */}
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {displayedProducts.length > 0 ? (
              displayedProducts.slice(0, 6).map(product => (
                <Col key={product.idProducto}>
                  <ProductCard product={product} />
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center text-muted">
                  No hay productos que coincidan con tus criterios.
                </p>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="benefits-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">
            Pensado para quienes construyen el futuro
          </h2>
          <Row xs={1} md={3} className="g-4">
            {[
              { icon: '⚙️', title: 'Optimización AEC', text: 'Ahorra entre 30% y 60% del tiempo de modelado con scripts y familias listas.' },
              { icon: '✅', title: 'Calidad Profesional', text: 'Productos revisados por especialistas para asegurar estándares BIM.' },
              { icon: '💡', title: 'Innovación Aplicada', text: 'Herramientas que ya resuelven problemas reales en AEC.' },
              { icon: '⏳', title: 'Tiempo Ganado', text: 'Recupera hasta 10 horas por semana de productividad.' },
              { icon: '🤝', title: 'Comunidad Validada', text: 'Creado por profesionales activos del sector AEC.' },
              { icon: '📊', title: 'Resultados Medibles', text: 'Reduce el retrabajo técnico hasta en un 40%.' }
            ].map((item, idx) => (
              <Col key={idx}>
                <div className="text-center p-4 shadow-sm rounded h-100">
                  <div className="display-4">{item.icon}</div>
                  <h5 className="mt-3">{item.title}</h5>
                  <p className="text-muted">{item.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default HomePage;
