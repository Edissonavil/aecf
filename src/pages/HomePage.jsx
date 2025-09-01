// src/pages/HomePage.jsx 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductsByStatus } from '../services/productApi';
import ProductCard from '../components/ProductCard';
import '../styles/HomePage.css';
import { Dropdown } from 'react-bootstrap';

const HomePage = () => {

  const [allApprovedProducts, setAllApprovedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeCountries, setActiveCountries] = useState([]);
  const [activeSpecialties, setActiveSpecialties] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProductsByStatus('APROBADO', 0, 100);
        const data = res.data.content;
        data.sort((a, b) => new Date(b.createdAt || b.idProducto) - new Date(a.createdAt || a.idProducto));
        setAllApprovedProducts(data);
        setDisplayedProducts(data);

        const cats = Array.from(new Set(data.flatMap(p => p.categorias || []))).filter(Boolean).sort();
        const coun = Array.from(new Set(data.map(p => p.pais).filter(Boolean))).sort();
        const specs = Array.from(new Set((data.flatMap(p => p.especialidades || []).filter(Boolean)))).sort();
        setAvailableCategories(cats);
        setAvailableCountries(coun.slice(0, 5));
        setAvailableSpecialties(specs);
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
    let filtered = allApprovedProducts
      .filter(p =>
        (p.nombre || p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(p =>
        activeCategories.length === 0 || activeCategories.some(cat => (p.categorias || []).includes(cat))
      )
      .filter(p =>
        activeCountries.length === 0 || activeCountries.includes(p.pais)
      )
      .filter(p =>
        activeSpecialties.length === 0 || activeSpecialties.some(sp => (p.especialidades || []).includes(sp))
      );
    setDisplayedProducts(filtered);
  }, [
    searchTerm,
    activeCategories,
    activeCountries,
    activeSpecialties,
    allApprovedProducts
  ]);

  const handleCheckboxChange = (filterType, value) => {
    const setter = {
      categories: setActiveCategories,
      countries: setActiveCountries,
      specialties: setActiveSpecialties
    }[filterType];

    const activeFilters = {
      categories: activeCategories,
      countries: activeCountries,
      specialties: activeSpecialties
    }[filterType];

    if (activeFilters.includes(value)) {
      setter(activeFilters.filter(item => item !== value));
    } else {
      setter([...activeFilters, value]);
    }
  };

  const getDropdownTitle = (filterType, activeFilters, defaultTitle) => {
    if (activeFilters.length === 0) {
      return defaultTitle;
    } else if (activeFilters.length === 1) {
      return activeFilters[0];
    } else {
      return `${activeFilters.length} ${defaultTitle.split(':')[0].trim()}s seleccionados`;
    }
  };

  if (loading) return <div className="text-center py-5">Cargando…</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <main>
      <section className="hero-section py-5">
        <div className="container">
          <h1 className="hero-title text-center">
            Más de <span className="highlight-text">300 herramientas</span> técnicas para transformar tu forma de construir
          </h1>
          <p className="hero-subtitle text-center mx-auto mb-4" style={{ transform: 'skewX(-5deg)' }}>
            El marketplace hecho por y para Arquitectos, Ingenieros y Constructores.
          </p>
          <p className="hero-subtitle text-center mx-auto mb-4">
            Sube tus recursos | Mejora tu flujo de trabajo | Comparte, soluciona y gana.
          </p>
          <div className="text-center">
            <Link to="/catalog" className="btn btn-primary btn-explore">Explorar Catálogo</Link>
          </div>
        </div>
      </section>
      <section id="catalogo" className="catalog-section py-5">
        <div className="container">
          <div className="d-flex flex-row align-items-center justify-content-center gap-3 mb-4">
            <div className="button-outer-wrapper">
              <div className="custom-button-group">
                <div className="custom-button-layer custom-button-shadow-top"></div>
                <div className="custom-button-layer custom-button-shadow-bottom"></div>
                <Link
                  to="/solicitudCreador"
                  className="custom-button-layer custom-button-main btn-explore"  // <- añadimos btn-explore
                >
                  Vende con Nosotros
                </Link>
              </div>
            </div>
            <div className="search-wrapper flex-grow-1">
              <input
                type="text"
                className="form-control search-input w-100"
                placeholder="Buscar productos por palabra clave..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <svg
                className="search-icon"
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
            </div>
          </div>
          {/* Filtros Actualizados */}
          <div className="mb-4 d-flex flex-wrap justify-content-center gap-3">

            {/* Filtro de Países */}
            <Dropdown className="flex-grow-1 flex-md-grow-0">
              <Dropdown.Toggle variant="outline-secondary" className="w-100 filter-dropdown-toggle">
                {getDropdownTitle('countries', activeCountries, 'País')}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-wide">
                {availableCountries.map(cn => (
                  <Dropdown.Item as="button" key={cn} onClick={e => e.stopPropagation()} className="dropdown-item-checkbox">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`country-check-${cn}`}
                        checked={activeCountries.includes(cn)}
                        onChange={() => handleCheckboxChange('countries', cn)}
                      />
                      <label className="form-check-label" htmlFor={`country-check-${cn}`}>
                        {cn}
                      </label>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* Filtro de Categorías */}
            <Dropdown className="flex-grow-1 flex-md-grow-0">
              <Dropdown.Toggle variant="outline-secondary" className="w-100 filter-dropdown-toggle">
                {getDropdownTitle('categories', activeCategories, 'Categorías')}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-wide">
                {availableCategories.map(cat => (
                  <Dropdown.Item as="button" key={cat} onClick={e => e.stopPropagation()} className="dropdown-item-checkbox">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`category-check-${cat}`}
                        checked={activeCategories.includes(cat)}
                        onChange={() => handleCheckboxChange('categories', cat)}
                      />
                      <label className="form-check-label" htmlFor={`category-check-${cat}`}>
                        {cat}
                      </label>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* Filtro de Especialidades */}
            <Dropdown className="flex-grow-1 flex-md-grow-0">
              <Dropdown.Toggle variant="outline-secondary" className="w-100 filter-dropdown-toggle">
                {getDropdownTitle('specialties', activeSpecialties, 'Especialidad')}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-wide">
                {availableSpecialties.map(sp => (
                  <Dropdown.Item as="button" key={sp} onClick={e => e.stopPropagation()} className="dropdown-item-checkbox">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`specialty-check-${sp}`}
                        checked={activeSpecialties.includes(sp)}
                        onChange={() => handleCheckboxChange('specialties', sp)}
                      />
                      <label className="form-check-label" htmlFor={`specialty-check-${sp}`}>
                        {sp}
                      </label>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {/* -- Product Grid -- */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {displayedProducts.length > 0 ? (
              displayedProducts.slice(0, 8).map(product => (
                <div key={product.idProducto} className="col">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="text-center col-12 text-muted">
                No hay productos que coincidan con tus criterios.
              </p>
            )}
          </div>
        </div>
      </section>
      <section id="beneficios" className="benefits-section py-5">
        <div className="container">
          <h2 className="benefits-title text-center mb-2 fw-normal">  Pensado para quienes construyen el futuro:</h2>
          <h2 className="benefits-title text-center mb-2">arquitectos, ingenieros y constructores.</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            <div className="col">
              <div className="benefit-item text-center p-4 shadow-sm rounded">
                <span className="icon">⚙️</span>
                <h3 className="h5 mt-2">Optimización AEC</h3>
                <p className="text-muted">Ahorra entre 30% y 60% del tiempo de modelado con scripts y familias listas para usar en tus flujos técnicos.</p>
              </div>
            </div>
            <div className="col">
              <div className="benefit-item text-center p-4 shadow-sm rounded">
                <span className="icon">✅</span>
                <h3 className="h5 mt-2">Calidad Profesional</h3>
                <p className="text-muted">Cada recurso es revisado por especialistas para asegurar compatibilidad, limpieza de datos y estándares BIM.</p>
              </div>
            </div>
            <div className="col">
              <div className="benefit-item text-center p-4 shadow-sm rounded">
                <span className="icon">💡</span>
                <h3 className="h5 mt-2">Innovación Aplicada</h3>
                <p className="text-muted">Accede a herramientas técnicas que ya están resolviendo problemas reales en oficinas de arquitectura e ingeniería.</p>
              </div>
            </div>
            <div className="col">
              <div className="benefit-item text-center p-4 shadow-sm rounded">
                <span className="icon">⏳</span>
                <h3 className="h5 mt-2">Tiempo Ganado</h3>
                <p className="text-muted">Implementa recursos que reducen tareas repetitivas y te devuelven hasta 10 horas por semana de productividad.</p>
              </div>
            </div>
            <div className="col">
              <div className="benefit-item text-center p-4 shadow-sm rounded">
                <span className="icon">🤝</span>
                <h3 className="h5 mt-2">Comunidad Validada</h3>
                <p className="text-muted">El 100% de nuestros productos han sido creados por profesionales activos del sector AEC, no por terceros genéricos.</p>
              </div>
            </div>
            <div className="col">
              <div className="benefit-item text-center p-4 shadow-sm rounded">
                <span className="icon">📊</span>
                <h3 className="h5 mt-2">Resultados Medibles</h3>
                <p className="text-muted">Diseña con herramientas que aumentan la precisión y reducen el retrabajo técnico hasta en un 40%.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;