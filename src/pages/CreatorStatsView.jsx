// src/pages/CollaboratorStatsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Calendar, DollarSign, ShoppingBag, Package, TrendingUp,
  User, MapPin, CreditCard, Award, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/CreatorStatsView.css'; // Importa el archivo CSS personalizado

// Define la URL base para el Stats Service
const STATS_API_BASE_URL = 'http://localhost:8086/api/stats';

const CreatorStatsView = () => {
  const { authToken, isAuthLoading, username: authUsername } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');

  // Estados para los datos
  const [myStats, setMyStats] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Configuración de colores para gráficos
  const COLORS = ['#FF00FF', '#00C49F', '#FFBB28', '#0088FE', '#FF8042', '#8884d8'];

  // Opciones de años (últimos 3 años)
  const yearOptions = Array.from({ length: 3 }, (_, i) =>
    new Date().getFullYear() - i
  );

  // Opciones de meses
  const monthOptions = [
    { value: '', label: 'Todo el año' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Función para hacer llamadas a la API
  const apiCall = useCallback(async (path, options = {}) => {
    if (!authToken) {
      throw new Error("No hay token de autenticación disponible. Por favor, inicie sesión.");
    }

    const fullUrl = `${STATS_API_BASE_URL}${path}`;
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData) {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (e) {
        const responseText = await response.text();
        console.error("Error al parsear la respuesta de error (no es JSON, podría ser HTML):", responseText);
        if (response.status === 401) {
          errorMessage = "Acceso no autorizado. Por favor, inicie sesión.";
        } else if (response.status === 403) {
          errorMessage = "Permiso denegado. No tiene los roles necesarios.";
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}. Consulte la consola para más detalles.`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }, [authToken]);

  // Cargar mis estadísticas
  const loadMyStats = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
      });

      const data = await apiCall(`/collaborator/my-stats?${params}`);
      setMyStats(data);
    } catch (err) {
      setError('Error al cargar mis estadísticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, apiCall, authToken]);

  // Cargar mis productos
  const loadMyProducts = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
      });

      const data = await apiCall(`/collaborator/my-products?${params}`);
      setMyProducts(data);
    } catch (err) {
      setError('Error al cargar mis productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, apiCall, authToken]);

  // Efecto para cargar datos cuando cambian los filtros o el token está disponible
  useEffect(() => {
    if (!isAuthLoading && authToken) {
      setError(null);
      if (activeTab === 'overview') {
        loadMyStats();
      } else if (activeTab === 'products') {
        loadMyProducts();
      }
    } else if (!isAuthLoading && !authToken) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión.");
    }
  }, [authToken, isAuthLoading, selectedYear, selectedMonth, activeTab, loadMyStats, loadMyProducts]);

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Función para formatear el nombre del método de pago
  const formatPaymentMethodName = (methodName) => {
    switch (methodName) {
      case 'MANUAL_TRANSFER':
        return 'Pago DeUna';
      case 'PAYPAL':
        return 'Paypal';
      default:
        return methodName;
    }
  };

  // Componente de tarjeta estadística
  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className={`stat-card-item card-border-${color}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className={`icon-circle icon-bg-${color}`}>
            <Icon className={`w-6 h-6 icon-text-${color}`} />
          </div>
          <div className="ms-3">
            <h3 className="card-title fs-6 fw-medium text-secondary mb-1">{title}</h3>
            <p className="card-text fs-3 fw-bold text-dark mb-0">{value}</p>
            {subtitle && <p className="card-text text-sm text-secondary mb-0">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`d-flex align-items-center text-sm ${
            trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-secondary'
          }`}>
            <TrendingUp className={`w-4 h-4 me-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  // Componente de información del colaborador
  const CollaboratorInfo = () => {
    const currentUsername = authUsername;
    const countryFromProduct = myProducts.length > 0 ? myProducts[0].country : 'N/A';

    return (
      <div className="stats-card-minimal mb-4">
        <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
          <User className="w-6 h-6 me-2 text-fuchsia-custom" />
          Mi Información
        </h3>
        <div className="row g-3">
          <div className="col-md-4 d-flex align-items-center">
            <User className="w-5 h-5 text-secondary me-2" />
            <span className="fs-6 text-secondary fw-semibold">Usuario:</span>
            <span className="ms-2 fw-medium text-dark">{currentUsername || 'N/A'}</span>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <MapPin className="w-5 h-5 text-secondary me-2" />
            <span className="fs-6 text-secondary fw-semibold">País:</span>
            <span className="ms-2 fw-medium text-dark">{countryFromProduct}</span>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <Award className="w-5 h-5 text-secondary me-2" />
            <span className="fs-6 text-secondary fw-semibold">Estado:</span>
            <span className="badge badge-status-active ms-2">Activo</span>
          </div>
        </div>
      </div>
    );
  };

  // Pestaña de resumen general
  const OverviewTab = () => (
    <div className="d-grid gap-4">
      <CollaboratorInfo />

      {/* Tarjetas de estadísticas principales */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div className="col">
          <StatCard
            title="Mis Ventas Totales"
            value={formatCurrency(myStats?.totalRevenue)}
            icon={DollarSign}
            color="fuchsia"
            subtitle="Ingresos generados"
          />
        </div>
        <div className="col">
          <StatCard
            title="Órdenes Recibidas"
            value={myStats?.totalOrders?.toLocaleString()}
            icon={ShoppingBag}
            color="blue"
            subtitle="Pedidos completados"
          />
        </div>
        <div className="col">
          <StatCard
            title="Productos Vendidos"
            value={myStats?.totalProducts?.toLocaleString()}
            icon={Package}
            color="purple"
            subtitle="Unidades vendidas"
          />
        </div>
        <div className="col">
          <StatCard
            title="Productos Activos"
            value={myStats?.productSales?.length?.toLocaleString() || '0'}
            icon={Package}
            color="orange"
            subtitle="En catálogo"
          />
        </div>
      </div>

      {/* Nuevo título para la sección de métodos de pago */}
      <h2 className="fs-4 fw-bold mb-0 text-dark">Análisis de Métodos de Pago</h2>

      {/* Gráficos de métodos de pago */}
      {myStats?.paymentMethods && myStats.paymentMethods.length > 0 && (
        <div className="stats-card-minimal">
          <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
            <CreditCard className="w-6 h-6 me-2 text-fuchsia-custom" />
            Métodos de Pago Preferidos
          </h3>
          <div className="row g-4">
            <div className="col-lg-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={myStats.paymentMethods.map(p => ({
                      ...p,
                      name: formatPaymentMethodName(p.paymentMethod)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalAmount"
                  >
                    {myStats.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="col-lg-6">
              <div className="d-grid gap-3">
                {myStats.paymentMethods.map((method, index) => (
                  <div key={method.paymentMethod} className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 shadow-sm">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-3"
                        style={{ width: '1rem', height: '1rem', backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="fw-semibold text-secondary">{formatPaymentMethodName(method.paymentMethod)}</span>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-dark">{formatCurrency(method.totalAmount)}</div>
                      <div className="text-sm text-secondary">{method.transactionCount} órdenes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de ventas por mes */}
      {myStats && myStats.monthlySales && myStats.monthlySales.length > 0 && (
        <div className="stats-card-minimal">
          <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
            <TrendingUp className="w-6 h-6 me-2 text-fuchsia-custom" />
            Tendencia de Ventas Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={myStats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Ventas']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#FF00FF" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top productos vendidos */}
      {myStats?.productSales && myStats.productSales.length > 0 && (
        <div className="stats-card-minimal">
          <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
            <Package className="w-6 h-6 me-2 text-fuchsia-custom" />
            Mis Productos Más Vendidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={myStats.productSales.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill="#FF00FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // Pestaña de productos detallada
  const ProductsTab = () => (
    <div className="d-grid gap-4">
      {myProducts && myProducts.length > 0 ? (
        <div className="stats-card-minimal overflow-hidden">
          <div className="card-header p-4 border-bottom border-gray-200 bg-white"> {/* Asegurar fondo blanco */}
            <h3 className="card-title fs-5 fw-bold d-flex align-items-center text-dark mb-0">
              <Package className="w-6 h-6 me-2 text-fuchsia-custom" />
              Detalle de Mis Productos
            </h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                    Producto
                  </th>
                  <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                    Ventas
                  </th>
                  <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                    Ingresos
                  </th>
                  <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                    Precio Promedio
                  </th>
                  <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <img
                            className="product-image-thumbnail"
                            src={product.image || 'https://placehold.co/48x48/E0E0E0/555555?text=Prod'}
                            alt={product.productName}
                          />
                        </div>
                        <div>
                          <div className="fs-6 fw-medium text-dark">{product.productName}</div>
                          <div className="text-sm text-secondary">ID: {product.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fs-6 text-dark">
                      {product.totalQuantity || 0} unidades
                    </td>
                    <td className="fs-6 text-dark">
                      {formatCurrency(product.totalSales)}
                    </td>
                    <td className="fs-6 text-dark">
                      {formatCurrency(product.unitPrice)}
                    </td>
                    <td>
                      <span className={product.status === 'active' ? 'badge-status-active' : 'badge-status-inactive'}>
                        {product.status || 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="stats-card-minimal text-center p-5">
          <Package className="mx-auto mb-4 text-secondary" style={{width: '4rem', height: '4rem'}} />
          <h3 className="mt-2 fs-5 fw-bold text-dark">No hay productos</h3>
          <p className="mt-1 fs-6 text-secondary">
            No se encontraron productos para el período seleccionado.
          </p>
        </div>
      )}
    </div>
  );

  // Componente de error
  const ErrorMessage = () => (
    <div className="alert alert-danger d-flex align-items-center rounded-3 shadow-sm p-4 mb-4" role="alert">
      <AlertCircle className="me-3" style={{width: '1.5rem', height: '1.5rem'}} />
      <div className="flex-grow-1">
        <h3 className="alert-heading fs-5 fw-semibold mb-1">Error</h3>
        <p className="mb-0 fs-6">{error}</p>
      </div>
      <button
        type="button"
        className="btn-close-error btn-close-white ms-auto"
        aria-label="Cerrar"
        onClick={() => setError(null)}
      >
        ×
      </button>
    </div>
  );

  // Componente de carga
  const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border spinner-border-fuchsia me-3" role="status" style={{width: '2.5rem', height: '2.5rem'}}>
        <span className="visually-hidden">Cargando...</span>
      </div>
      <span className="fs-5 text-secondary">Cargando...</span>
    </div>
  );

  return (
    <div className="stats-view-container">
      <div className="container">
        {/* Header */}
        <div className="mb-5">
          <h1 className="creator-stats-title mb-2">
            Mis <span className="text-fuchsia-custom">Estadísticas</span>
          </h1>
        </div>

        {/* Filtros */}
        <div className="stats-card-minimal mb-4">
          <div className="row g-4 align-items-end">
            <div className="col-md-4">
              <label htmlFor="selectYear" className="form-label fs-6 fw-semibold text-secondary mb-2">
                Año
              </label>
              <select
                id="selectYear"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-select form-select-custom"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="selectMonth" className="form-label fs-6 fw-semibold text-secondary mb-2">
                Mes
              </label>
              <select
                id="selectMonth"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select form-select-custom"
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                onClick={() => activeTab === 'overview' ? loadMyStats() : loadMyProducts()}
                disabled={loading}
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center px-5 py-2"
              >
                <Calendar className="w-5 h-5 me-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {error && <ErrorMessage />}

        {loading && <LoadingSpinner />}

        {!loading && !error && (
          <>
            {/* Navegación de pestañas */}
            <div className="stats-card-minimal mb-4">
              <ul className="nav nav-tabs nav-tabs-minimal card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Resumen General
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                  >
                    Mis Productos
                  </button>
                </li>
              </ul>
            </div>
            {activeTab === 'overview' && myStats && <OverviewTab />}
            {activeTab === 'products' && <ProductsTab />}
          </>
        )}
      </div>
    </div>
  );
};

export default CreatorStatsView;