// src/api.js
export async function fetchProducts() {
  const resp = await fetch('http://localhost:8083/api/products?page=0&size=100');
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const body = await resp.json();
  // asumimos que viene un objeto Page con .content
  return body.content || body;
}

