// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductsByStatus } from '../services/productApi';
import ProductCard from '../components/ProductCard'; // ¡Importa ProductCard!
import '../styles/HomePage.css'; // Asegúrate de que este CSS contiene los estilos de 'product-card'



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
        // ordenar por fecha o id
        data.sort((a, b) => new Date(b.createdAt || b.idProducto) - new Date(a.createdAt || a.idProducto));
        setAllApprovedProducts(data);
        setDisplayedProducts(data);

        // Usar Set para asegurar nicidad y filter(Boolean) para quitar null/undefined/vacío
        const cats = Array.from(new Set(data.flatMap(p => p.categorias || []))).filter(Boolean).sort();
        const coun = Array.from(new Set(data.map(p => p.pais).filter(Boolean))).sort();
        const specs = Array.from(new Set((data.flatMap(p => p.especialidades || []).filter(Boolean)))).sort();
        setAvailableCategories(['Todos', ...cats]);
        setAvailableCountries(['Todos', ...coun.slice(0, 5)]); // sólo 5 países
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
    let filtered = allApprovedProducts
      .filter(p =>
        (p.nombre || p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(p =>
        activeCategoryFilter === 'all' || (p.categorias || []).includes(activeCategoryFilter) // Usar includes para arrays
      )
      .filter(p =>
        activeCountryFilter === 'all' || p.pais === activeCountryFilter
      )
      .filter(p =>
        activeSpecialtyFilter === 'all' || (p.especialidades || []).includes(activeSpecialtyFilter)
      );
    setDisplayedProducts(filtered);

  }, [
    searchTerm,
    activeCategoryFilter,
    activeCountryFilter,
    activeSpecialtyFilter,
    allApprovedProducts

  ]);

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
            Sube tus recursos. 
          </p>
          <p className="hero-subtitle text-center mx-auto mb-4">
            Mejora tu flujo de trabajo.
          </p>
          <p className="hero-subtitle text-center mx-auto mb-4">
            Comparte, soluciona, gana.
          </p>
          <div className="text-center">
            <Link to="/catalog" className="btn btn-primary btn-explore">Explorar Catálogo</Link>
          </div>
        </div>
      </section>
      <section id="catalogo" className="catalog-section py-5">
        <div className="container">
          {/* Contenedor flex para el botón y la barra de búsqueda */}
          {/* flex-column para apilar en pantallas pequeñas (xs, sm), flex-md-row para lado a lado en medianas y grandes */}
          {/* align-items-center para centrado vertical, justify-content-center para centrado horizontal, gap-3 para espacio */}
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 mb-4">
            {/* El botón "Vende con Nosotros" */}
            {/* custom-button-wrapper es el contenedor principal para el efecto 3D */}
            {/* w-100 en sm y abajo para que ocupe todo el ancho, w-md-auto en md y arriba */}
            <div className="custom-button-wrapper w-100 w-md-auto">
                {/* Capa de sombra superior (rosa claro) */}
                <div className="custom-button-layer custom-button-shadow-top"></div>
                {/* Capa de sombra inferior (fucsia oscuro), se mueve al hacer hover */}
                <div className="custom-button-layer custom-button-shadow-bottom"></div>
                {/* El botón principal (fucsia eléctrico), se mueve en dirección opuesta al hacer hover */}
                <a className="custom-button-layer custom-button-main btn btn-fuchsia-electric" href="/users/sign_up">
                    Vende con Nosotros
                </a>
            </div>
            {/* Barra de búsqueda - ahora toma el espacio restante */}
            <div className="search-wrapper flex-grow-1 w-100">
                <input
                  type="text"
                  className="form-control search-input w-100" // w-100 para que ocupe todo el ancho de su contenedor
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
          {/* Filtros */}
          <div className="mb-4">
            {/* Países */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
              <span className="fw-bold pe-2">País:</span>
              {availableCountries.map(cn => (
                <button
                  key={cn}
                  className={`btn ${activeCountryFilter === (cn === 'Todos' ? 'all' : cn)
                    ? 'btn-fuchsia-electric text-white'
                    : 'btn-outline-secondary'
                    }`}
                  onClick={() =>
                    setActiveCountryFilter(cn === 'Todos' ? 'all' : cn)
                  }
                >
                  {cn}
                </button>
              ))}
            </div>
            {/* Categorías */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
              <span className="fw-bold pe-2">Categorías:</span>
              {availableCategories.map(cat => {
                const value = (cat === 'Todos') ? 'all' : cat;
                return (
                  <button
                    key={cat}
                    className={`btn ${activeCategoryFilter === value
                      ? 'btn-fuchsia-electric text-white'
                      : 'btn-outline-secondary'
                      }`}
                    onClick={() => setActiveCategoryFilter(value)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {/* Especialidades */}
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <span className="fw-bold pe-2">Especialidad:</span>
              {availableSpecialties.map(sp => (
                <button
                  key={sp}
                  className={`btn ${activeSpecialtyFilter === (sp === 'Todos' ? 'all' : sp)
                    ? 'btn-fuchsia-electric text-white'
                    : 'btn-outline-secondary'
                    }`}
                  onClick={() =>
                    setActiveSpecialtyFilter(sp === 'Todos' ? 'all' : sp)
                  }
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
          {/* -- Product Grid -- */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {displayedProducts.length > 0 ? (
              // Sólo mostramos las primeras 6 tarjetas
              displayedProducts.slice(0, 6).map(product => (
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
          <h2 className="benefits-title text-center mb-5">Pensado para quienes construyen el futuro:</h2>
          <h2 className="benefits-title text-center mb-5">arquitectos, ingenieros y constructores.</h2>
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