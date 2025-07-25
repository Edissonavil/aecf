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

  // FILE_SERVICE_BASE_URL ya no es necesario aquí si ProductCard lo maneja



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



        // extraer filtros únicos

        // Usar Set para asegurar unicidad y filter(Boolean) para quitar null/undefined/vacío

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

          <p className="hero-subtitle text-center mx-auto mb-4">

            El marketplace definitivo para profesionales de Arquitectura, Ingeniería y Construcción. Accede a recursos digitales de alta calidad y optimiza tus proyectos.

          </p>

          <div className="text-center">

            <Link to="/catalog" className="btn btn-primary btn-explore">Explorar Catálogo</Link>

          </div>

        </div>

      </section>



      <section id="catalogo" className="catalog-section py-5">

        <div className="container">

          <div className="search-wrapper mb-4">

            <input

              type="text"

              className="form-control search-input"

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

          {/* Filtros */}

          <div className="mb-4">

             {/* Países */}

             <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">

              <span className="fw-bold pe-2">País:</span>

              {availableCountries.map(cn => (

                <button

                  key={cn}

                  className={`btn ${

                    activeCountryFilter === (cn === 'Todos' ? 'all' : cn)

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

                    className={`btn ${

                      activeCategoryFilter === value

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

                  className={`btn ${

                    activeSpecialtyFilter === (sp === 'Todos' ? 'all' : sp)

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

          <h2 className="benefits-title text-center mb-5">Diseñado para el Profesional Moderno</h2>

          <div className="row row-cols-1 row-cols-md-3 g-4">

            <div className="col">

              <div className="benefit-item text-center p-4 shadow-sm rounded">

                <span className="icon">⚙️</span>

                <h3 className="h5 mt-2">Optimización y Eficiencia</h3>

                <p className="text-muted">Reduce horas de trabajo con familias paramétricas y scripts de automatización listos para usar.</p>

              </div>

            </div>

            <div className="col">

              <div className="benefit-item text-center p-4 shadow-sm rounded">

                <span className="icon">✅</span>

                <h3 className="h5 mt-2">Calidad Verificada</h3>

                <p className="text-muted">Cada producto en nuestro catálogo es revisado para asegurar los más altos estándares de calidad y compatibilidad.</p>

              </div>

            </div>

            <div className="col">

              <div className="benefit-item text-center p-4 shadow-sm rounded">

                <span className="icon">💡</span>

                <h3 className="h5 mt-2">Innovación Constante</h3>

                <p className="text-muted">Mantente a la vanguardia con acceso a las últimas herramientas y tecnologías que están definiendo el futuro del AEC.</p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

};



export default HomePage;