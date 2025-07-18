import React, { useEffect, useState } from 'react';
import { fetchAllProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="products-loading">Cargando productos...</p>;
  }

  if (products.length === 0) {
    return <p className="products-empty">No hay productos disponibles.</p>;
  }

  return (
    <main className="products-container">
      {products.map(prod => (
        <ProductCard key={prod.idProducto} product={prod} />
      ))}
    </main>
  );
};

export default ProductsPage;