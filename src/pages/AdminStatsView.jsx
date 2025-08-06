// src/pages/AdminStatsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Calendar, DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertCircle,
  Download, FileText, CheckCircle, XCircle, UserCheck, UserX, Eye, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminStatsView.css';

const STATS_API_BASE_URL = 'https://gateway-production-129e.up.railway.app/api/stats';

const AdminStatsView = () => {
  const { authToken, isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCollaborator, setSelectedCollaborator] = useState('');

  const [completeStats, setCompleteStats] = useState(null);
  const [collaboratorSales, setCollaboratorSales] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#FF00FF', '#00C49F', '#FFBB28', '#0088FE', '#FF8042', '#8884d8'];

  const yearOptions = Array.from({ length: 5 }, (_, i) =>
    new Date().getFullYear() - i
  );

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
          errorMessage = "Acceso no autorizado. Por favor, inicie sesión como administrador.";
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

  const loadCompleteStats = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
      });

      const data = await apiCall(`/admin/complete?${params}`);
      setCompleteStats(data);
    } catch (err) {
      setError('Error al cargar estadísticas generales: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, apiCall, authToken]);

  const loadCollaboratorSales = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
      });

      const data = await apiCall(`/admin/collaborators?${params}`);
      setCollaboratorSales(data);
    } catch (err) {
      setError('Error al cargar ventas por colaborador: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, apiCall, authToken]);

  const loadProductSales = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedCollaborator && { collaborator: selectedCollaborator }),
      });

      const data = await apiCall(`/admin/products?${params}`);
      setProductSales(data);
    } catch (err) {
      setError('Error al cargar ventas por producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedCollaborator, apiCall, authToken]);

  useEffect(() => {
    if (!isAuthLoading && authToken) {
      setError(null);
      if (activeTab === 'overview') {
        loadCompleteStats();
      } else if (activeTab === 'collaborators') {
        loadCollaboratorSales();
      } else if (activeTab === 'products') {
        loadProductSales();
      }
    } else if (!isAuthLoading && !authToken) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión.");
    }
  }, [authToken, isAuthLoading, selectedYear, selectedMonth, selectedCollaborator, activeTab, loadCompleteStats, loadCollaboratorSales, loadProductSales]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

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

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
    <div className={`stat-card-item card-border-${color}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
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
    </div>
  );

  const OverviewTab = () => (
    <div className="d-grid gap-4">
      {/* Panel de resumen estratégico */}
      <div className="stats-card-minimal p-4 mb-4">
        <h3 className="card-title fs-5 fw-bold mb-3 d-flex align-items-center text-dark">
          <TrendingUp className="w-6 h-6 me-2 text-fuchsia-custom" />
          Panel de Resumen Estratégico
        </h3>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <Users className="w-6 h-6 me-2 text-primary" />
              <div>
                <div className="fs-5 fw-bold text-dark">{completeStats?.totalCollaborators?.toLocaleString() || '0'}</div>
                <div className="text-secondary">Colaboradores Totales</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <Package className="w-6 h-6 me-2 text-success" />
              <div>
                <div className="fs-5 fw-bold text-dark">{completeStats?.totalProductsCount?.toLocaleString() || '0'}</div>
                <div className="text-secondary">Productos Totales</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <TrendingUp className="w-6 h-6 me-2 text-info" />
              <div>
                <div className="fs-5 fw-bold text-dark">
                  {completeStats?.monthlyGrowthPercentage ? `${completeStats.monthlyGrowthPercentage.toFixed(2)}%` : 'N/A'}
                </div>
                <div className="text-secondary">Crecimiento Último Mes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div className="col">
          <StatCard
            title="Ingresos Brutos"
            value={formatCurrency(completeStats?.totalRevenue)}
            subtitle="Ingresos generados antes de comisión"
            icon={DollarSign}
            color="fuchsia"
          />
        </div>
        <div className="col">
          <StatCard
            title="Comisión AECBlock"
            value={formatCurrency((completeStats?.totalRevenue || 0) * 0.5)}
            subtitle="50% de los ingresos brutos"
            icon={DollarSign}
            color="blue"
          />
        </div>
        <div className="col">
          <StatCard
            title="Órdenes Completadas"
            value={completeStats?.totalOrders?.toLocaleString()}
            icon={ShoppingBag}
            color="purple"
            onClick={() => setActiveTab('products')}
          />
        </div>
        <div className="col">
          <StatCard
            title="Clientes Adquiridos"
            value={completeStats?.totalCustomers?.toLocaleString() || '0'}
            icon={Users}
            color="orange"
            onClick={() => alert('Funcionalidad de desglose de clientes no implementada.')}
          />
        </div>
      </div>

      {/* Gráfico de Ventas Mensuales (Line Chart) */}
      {completeStats && completeStats.monthlySales && completeStats.monthlySales.length > 0 ? (
        <div className="stats-card-minimal">
          <h3 className="card-title fs-5 fw-bold mb-4 text-dark">Tendencia de Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completeStats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Ventas']} />
              <Legend />
              <Line type="monotone" dataKey="Venta Mensual" stroke="#FF00FF" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="stats-card-minimal text-center p-5">
          <TrendingUp className="mx-auto mb-4 text-secondary" style={{ width: '4rem', height: '4rem' }} />
          <h3 className="mt-2 fs-5 fw-bold text-dark">Sin datos de ventas mensuales</h3>
          <p className="mt-1 fs-6 text-secondary">
            No hay datos de ventas mensuales para el período seleccionado.
          </p>
        </div>
      )}

      {/* Top productos vendidos (últimos 30 días) */}
      {completeStats?.topProductsLast30Days && completeStats.topProductsLast30Days.length > 0 ? (
        <div className="stats-card-minimal">
          <h3 className="card-title fs-5 fw-bold mb-4 text-dark">Top Productos Vendidos (Últimos 30 Días)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completeStats.topProductsLast30Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Cantidad Vendida']} />
              <Legend />
              <Bar dataKey="Productos vendidos" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="stats-card-minimal text-center p-5">
          <ShoppingCart className="mx-auto mb-4 text-secondary" style={{ width: '4rem', height: '4rem' }} />
          <h3 className="mt-2 fs-5 fw-bold text-dark">Sin datos de top productos</h3>
          <p className="mt-1 fs-6 text-secondary">
            No se encontraron datos de los productos más vendidos para el período.
          </p>
        </div>
      )}

    </div>
  );

  const CollaboratorsTab = () => (
    <div className="stats-card-minimal">
      <h3 className="card-title fs-5 fw-bold mb-4 text-dark">Ventas por Colaborador</h3>

      {/* Botones de filtro Activos/Inactivos para colaboradores (eliminados si no hay status) */}
      {/* Se mantiene el botón de exportar CSV */}
      <div className="mb-4 d-flex gap-2">
        <button className="btn btn-outline-info btn-sm" onClick={() => exportToCSV(collaboratorSales, 'ventas_colaboradores')}>
          <Download className="me-1" size={16} /> Exportar CSV
        </button>
      </div>

      {/* Gráfico de barras */}
      <div className="mb-4">
        {collaboratorSales && collaboratorSales.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={collaboratorSales.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="collaboratorUsername" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="totalSales" fill="#FF00FF" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center p-5 text-secondary">No hay datos de ventas por colaborador para el período seleccionado.</div>
        )}
      </div>

      {/* Tabla de colaboradores */}
      <div className="table-responsive">
        {collaboratorSales && collaboratorSales.length > 0 ? (
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Colaborador
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  País
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Órdenes
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Cantidad Vendida
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Ventas Totales
                </th>
              </tr>
            </thead>
            <tbody>
              {collaboratorSales.map((collaborator, index) => (
                <tr key={index}>
                  <td className="fs-6 fw-medium text-dark">
                    {collaborator.collaboratorUsername}
                  </td>
                  <td className="fs-6 text-secondary">
                    {collaborator.country}
                  </td>
                  <td className="fs-6 text-secondary">
                    {collaborator.ordersCount?.toLocaleString()}
                  </td>
                  <td className="fs-6 text-secondary">
                    {collaborator.totalQuantity?.toLocaleString()}
                  </td>
                  <td className="fs-6 text-dark">
                    {formatCurrency(collaborator.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-5 text-secondary">No hay colaboradores para mostrar.</div>
        )}
      </div>
    </div>
  );

  const ProductsTab = () => (
    <div className="stats-card-minimal">
      <h3 className="card-title fs-5 fw-bold mb-4 text-dark">Ventas por Producto</h3>

      {/* Filtro adicional por colaborador y botón de exportar */}
      <div className="mb-4 d-flex gap-2 align-items-center">
        <label htmlFor="selectCollaborator" className="form-label fs-6 fw-semibold text-secondary mb-0">Filtrar por Colaborador:</label>
        <select
          id="selectCollaborator"
          value={selectedCollaborator}
          onChange={(e) => setSelectedCollaborator(e.target.value)}
          className="form-select form-select-custom w-auto d-inline-block"
        >
          <option value="">Todos los colaboradores</option>
          {collaboratorSales.map((collaborator, index) => (
            <option key={index} value={collaborator.collaboratorUsername}>
              {collaborator.collaboratorUsername}
            </option>
          ))}
        </select>
        <button className="btn btn-outline-info btn-sm ms-auto" onClick={() => exportToCSV(productSales, 'ventas_productos')}>
          <Download className="me-1" size={16} /> Exportar CSV
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="table-responsive">
        {productSales && productSales.length > 0 ? (
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Producto
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Colaborador
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  País
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Precio Unit.
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Cantidad
                </th>
                <th scope="col" className="text-start fs-6 fw-semibold text-secondary text-uppercase">
                  Ventas Totales
                </th>
              </tr>
            </thead>
            <tbody>
              {productSales.slice(0, 20).map((product, index) => (
                <tr key={index}>
                  <td className="fs-6 fw-medium text-dark">
                    {product.productName}
                  </td>
                  <td className="fs-6 text-secondary">
                    {product.uploaderUsername}
                  </td>
                  <td className="fs-6 text-secondary">
                    {product.country}
                  </td>
                  <td className="fs-6 text-secondary">
                    {formatCurrency(product.unitPrice)}
                  </td>
                  <td className="fs-6 text-secondary">
                    {product.totalQuantity?.toLocaleString()}
                  </td>
                  <td className="fs-6 text-dark">
                    {formatCurrency(product.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-5 text-secondary">No hay productos para mostrar.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="stats-view-container">
      <div className="container">
        {/* Header */}
        <div className="mb-5">
          <h1 className="admin-stats-title mb-2">
            Panel de Estadísticas - <span className="text-fuchsia-custom">Administrador</span>
          </h1>
          <p className="lead text-secondary">Vista general de la plataforma</p>
        </div>

        {/* Filtros */}
        <div className="stats-card-minimal mb-4">
          <div className="row g-4 align-items-end">
            <div className="col-md-4">
              <label htmlFor="selectYear" className="form-label fs-6 fw-semibold text-secondary mb-2">
                <Calendar className="d-inline-block me-2 text-fuchsia-custom" style={{ width: '1.25rem', height: '1.25rem' }} />
                Año
              </label>
              <select
                id="selectYear"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-select form-select-custom"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="selectMonth" className="form-label fs-6 fw-semibold text-secondary mb-2">
                Mes (Opcional)
              </label>
              <select
                id="selectMonth"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select form-select-custom"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 d-flex align-items-end">
              {loading && (
                <div className="d-flex align-items-center text-fuchsia-600-custom fs-6 fw-semibold">
                  <div className="spinner-border spinner-border-sm me-2 spinner-border-fuchsia" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  Cargando...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center rounded-3 shadow-sm p-4 mb-4" role="alert">
            <AlertCircle className="me-3" style={{ width: '1.5rem', height: '1.5rem' }} />
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
        )}

        {/* Alerta de revisión de comprobantes */}
        {completeStats && (completeStats.paymentsToVerify > 0 || completeStats.paymentErrors > 0) ? (
          <div className={`alert alert-${completeStats.paymentErrors > 0 ? 'danger' : 'warning'} d-flex align-items-center rounded-3 shadow-sm p-3 mb-4`} role="alert">
            {completeStats.paymentErrors > 0 ? (
              <XCircle className="me-2" size={20} />
            ) : (
              <AlertCircle className="me-2" size={20} />
            )}
            <div>
              {completeStats.paymentsToVerify > 0 && `Hay ${completeStats.paymentsToVerify} pagos pendientes de verificación. `}
              {completeStats.paymentErrors > 0 && `Se detectaron ${completeStats.paymentErrors} errores en comprobantes de pago.`}
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Cerrar"
              onClick={() => setCompleteStats(prev => ({ ...prev, paymentsToVerify: 0, paymentErrors: 0 }))}
            ></button>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="stats-card-minimal mb-4">
          <ul className="nav nav-tabs nav-tabs-minimal card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp className="d-inline-block me-2" style={{ width: '1.25rem', height: '1.25rem' }} />
                Resumen General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'collaborators' ? 'active' : ''}`}
                onClick={() => setActiveTab('collaborators')}
              >
                <Users className="d-inline-block me-2" style={{ width: '1.25rem', height: '1.25rem' }} />
                Colaboradores
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Package className="d-inline-block me-2" style={{ width: '1.25rem', height: '1.25rem' }} />
                Productos
                {completeStats?.productsPendingReview > 0 && (
                  <span className="badge bg-danger ms-2 rounded-pill">
                    {completeStats.productsPendingReview}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Content */}
        {activeTab === 'overview' && completeStats && <OverviewTab />}
        {activeTab === 'collaborators' && <CollaboratorsTab />}
        {activeTab === 'products' && <ProductsTab />}
      </div>
    </div>
  );
};

export default AdminStatsView;