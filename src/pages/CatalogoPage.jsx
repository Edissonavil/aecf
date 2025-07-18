// src/pages/CatalogPage.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { getProductsByStatus } from '../services/productApi';

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

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
        const response = await getProductsByStatus('APROBADO', 0, 100);
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

  // 2. Apply filters whenever products or selected filters change
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

    setFilteredProducts(currentFiltered);
  }, [products, selectedCategories, selectedCountries, selectedSpecialties]);

  if (loading) return <div className="text-center py-5">Cargando productos…</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">Catálogo de Productos</h2>

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
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => setSelectedCategories([])}
            >
              Limpiar Categorías
            </button>
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
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => setSelectedCountries([])}
            >
              Limpiar Países
            </button>
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
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => setSelectedSpecialties([])}
            >
              Limpiar Especialidades
            </button>
          )}
        </div>
      </div>

      <hr className="my-4"/> {/* Visual separator */}

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
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
  );

}