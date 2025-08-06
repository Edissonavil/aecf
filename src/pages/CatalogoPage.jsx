// src/pages/CatalogPage.jsx
import React, { useEffect, useState } from 'react';
import { Form, Row, Col, InputGroup, Button, Container } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { getProductsByStatus } from '../services/productApi';
import { Search } from 'lucide-react'; // Importamos el ícono de búsqueda de lucide-react para un look moderno

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Nuevo estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // States for selected filters - NOW ARRAYS FOR MULTI-SELECTION
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  // States for available filter options
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);

  // 1. Fetch all (approved) products on page load using getProductsByStatus
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // Ajustamos la paginación para obtener más productos
        const response = await getProductsByStatus('APROBADO', 0, 200); 
        const fetchedProducts = response.data.content || [];

        setProducts(fetchedProducts);
        // Initially, all products are displayed. Filters will apply in the next useEffect.
        setFilteredProducts(fetchedProducts);

        // Extract unique options for filters
        const uniqueCategories = [...new Set(fetchedProducts.flatMap(p => p.categorias || []))].filter(Boolean).sort();
        const uniqueCountries = [...new Set(fetchedProducts.map(p => p.pais).filter(Boolean))].sort();
        const uniqueSpecialties = [...new Set(fetchedProducts.flatMap(p => p.especialidades || []))].filter(Boolean).sort();

        // Set available filter options
        setAvailableCategories(uniqueCategories);
        setAvailableCountries(uniqueCountries);
        setAvailableSpecialties(uniqueSpecialties);

      } catch (e) {
        console.error('Error al cargar productos:', e);
        setError('No se pudieron cargar los productos aprobados. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []); // Runs only once on mount

  // Handlers for checkbox changes
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCountryChange = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };
  
  // Handler para la barra de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 2. Apply all filters (including search term) whenever products or selected filters change
  useEffect(() => {
    let currentFiltered = products;

    // Filter by Categories
    if (selectedCategories.length > 0) {
      currentFiltered = currentFiltered.filter(product =>
        product.categorias && selectedCategories.some(cat => product.categorias.includes(cat))
      );
    }

    // Filter by Countries
    if (selectedCountries.length > 0) {
      currentFiltered = currentFiltered.filter(product =>
        selectedCountries.includes(product.pais)
      );
    }

    // Filter by Specialties
    if (selectedSpecialties.length > 0) {
      currentFiltered = currentFiltered.filter(product =>
        product.especialidades && selectedSpecialties.some(spec => product.especialidades.includes(spec))
      );
    }
    
    // NEW: Filter by Search Term
    if (searchTerm.trim() !== '') {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(product =>
        product.productName.toLowerCase().includes(lowercasedSearchTerm) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(lowercasedSearchTerm))
      );
    }

    setFilteredProducts(currentFiltered);
  }, [products, selectedCategories, selectedCountries, selectedSpecialties, searchTerm]);

  if (loading) return <div className="text-center py-5">Cargando productos…</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-center">Catálogo de Productos</h2>

      {/* NEW: Search Bar */}
      <Row className="mb-4 justify-content-center">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              Borrar
            </Button>
            <Button variant="outline-primary" type="button">
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
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Filter Section - Professional Multi-Select Checkboxes */}
      <div className="row mb-4 g-4 align-items-start"> {/* Align items to start for better multi-line checkboxes */}
        {/* Category Filter */}
        <div className="col-md-4">
          <h5 className="mb-3">Categoría</h5>
          <div className="filter-options-scroll"> {/* Add a class for potential scrolling if many options */}
            {availableCategories.map(cat => (
              <div className="form-check" key={cat}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={cat}
                  id={`cat-${cat}`}
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                <label className="form-check-label" htmlFor={`cat-${cat}`}>
                  {cat}
                </label>
              </div>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <Button
              variant="sm"
              className="btn-outline-secondary mt-2"
              onClick={() => setSelectedCategories([])}
            >
              Limpiar Categorías
            </Button>
          )}
        </div>

        {/* Country Filter */}
        <div className="col-md-4">
          <h5 className="mb-3">País</h5>
          <div className="filter-options-scroll">
            {availableCountries.map(country => (
              <div className="form-check" key={country}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={country}
                  id={`country-${country}`}
                  checked={selectedCountries.includes(country)}
                  onChange={() => handleCountryChange(country)}
                />
                <label className="form-check-label" htmlFor={`country-${country}`}>
                  {country}
                </label>
              </div>
            ))}
          </div>
          {selectedCountries.length > 0 && (
            <Button
              variant="sm"
              className="btn-outline-secondary mt-2"
              onClick={() => setSelectedCountries([])}
            >
              Limpiar Países
            </Button>
          )}
        </div>

        {/* Specialty Filter */}
        <div className="col-md-4">
          <h5 className="mb-3">Especialidad</h5>
          <div className="filter-options-scroll">
            {availableSpecialties.map(spec => (
              <div className="form-check" key={spec}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={spec}
                  id={`spec-${spec}`}
                  checked={selectedSpecialties.includes(spec)}
                  onChange={() => handleSpecialtyChange(spec)}
                />
                <label className="form-check-label" htmlFor={`spec-${spec}`}>
                  {spec}
                </label>
              </div>
            ))}
          </div>
          {selectedSpecialties.length > 0 && (
            <Button
              variant="sm"
              className="btn-outline-secondary mt-2"
              onClick={() => setSelectedSpecialties([])}
            >
              Limpiar Especialidades
            </Button>
          )}
        </div>
      </div>

      <hr className="my-4"/> {/* Visual separator */}

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Col key={product.idProducto}>
              <ProductCard product={product} />
            </Col>
          ))
        ) : (
          <p className="text-center col-12 text-muted">
            No hay productos que coincidan con tus criterios.
          </p>
        )}
      </div>
    </Container>
  );
}