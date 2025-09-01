// src/pages/CollaboratorStatsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ShoppingBag, Package, TrendingUp, DollarSign,
  User, MapPin, CreditCard, Award, CheckCircle, Rocket, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/CreatorStatsView.css';

const STATS_API_BASE_URL = 'https://gateway-production-129e.up.railway.app/api/stats';

const CreatorStatsView = () => {
  const { authToken, isAuthLoading, username: authUsername } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');

  // Estados para los datos
  const [myStats, setMyStats] = useState(null);
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
      setError(null); // Limpiar errores anteriores antes de una nueva carga
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
      });

      const data = await apiCall(`/collaborator/my-stats?${params}`);
      setMyStats(data);
    } catch (err) {
      if (err.message.includes("Error interno del servidor") || err.message.includes("Error 500")) {
        setMyStats({
          totalOrders: 0,
          productSales: [],
          monthlySales: [],
          totalRevenue: 0,
          productsPendingReview: 0, // Asegurar que todos los campos relevantes estén en cero/vacíos
        });
        setError(null); // No mostrar error en este caso
      } else {
        setError('Error al cargar mis estadísticas: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, apiCall, authToken]);


  // Efecto para cargar datos cuando cambian los filtros o el token está disponible
  useEffect(() => {
    if (!isAuthLoading && authToken) {
      setError(null);
      loadMyStats();
    } else if (!isAuthLoading && !authToken) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión.");
    }
  }, [authToken, isAuthLoading, selectedYear, selectedMonth, loadMyStats]);


  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Calcular próxima fecha de pago (5to día del mes siguiente)
  const getNextPaymentDate = () => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth(); // Mes actual (0-11)
    const day = 5; // Quinto día del mes

    // Si ya es el día 5 o posterior del mes actual, el pago es el próximo mes
    if (today.getDate() >= day) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    const paymentDate = new Date(year, month, day);
    return paymentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
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
    // Verifica si myStats y productSales existen y tienen elementos antes de intentar acceder a country
    const countryFromProduct = myStats?.productSales && myStats.productSales.length > 0 ? myStats.productSales[0].country : 'N/A';

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
  const OverviewTab = () => {
    const netRevenue = (myStats?.totalRevenue || 0) * 0.5;
    const productsUnderReview = myStats?.productsPendingReview || 0;
    const monthlySalesData = myStats?.monthlySales || [];

    // Calcular la acumulación de ventas mensuales para el gráfico de ojiva
    let cumulativeRevenue = 0;
    const cumulativeMonthlySales = monthlySalesData.map(sale => {
      cumulativeRevenue += sale.revenue;
      return { ...sale, cumulativeRevenue: cumulativeRevenue };
    });

    const productSalesData = myStats?.productSales || [];

    // Calcular la acumulación de ventas por producto para el gráfico de ojiva
    let cumulativeProductSales = 0;
    const cumulativeProductSalesData = productSalesData.map(sale => {
      cumulativeProductSales += sale.totalSales;
      return { ...sale, cumulativeSales: cumulativeProductSales };
    });

    return (
      <div className="d-grid gap-4">
        {/* Aquí mostramos la información del colaborador solo si myStats no es nulo */}
        {myStats && <CollaboratorInfo />}

        {/* Tarjetas de estadísticas principales */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div className="col">
            <StatCard
              title="Mis Ingresos Netos"
              value={formatCurrency(netRevenue)}
              icon={DollarSign}
              color="fuchsia"
              subtitle="Ganancias estimadas"
            />
          </div>
          <div className="col">
            <StatCard
              title="Órdenes Recibidas"
              value={myStats?.totalOrders?.toLocaleString() || '0'}
              icon={ShoppingBag}
              color="blue"
              subtitle="Pedidos completados"
            />
          </div>
          <div className="col">
            <StatCard
              title="Próximo Pago"
              value={getNextPaymentDate()}
              icon={CreditCard}
              color="green"
              subtitle="Fecha estimada"
            />
          </div>
          <div className="col">
            <StatCard
              title="Productos por Revisar"
              value={productsUnderReview?.toLocaleString() || '0'}
              icon={Package}
              color="orange"
              subtitle="Pendientes de aprobación"
            />
          </div>
        </div>

        {/* Mensajes motivadores/callouts, solo si hay órdenes o productos */}
        {myStats?.totalOrders > 0 && (
          <div className="alert alert-success d-flex align-items-center rounded-3 shadow-sm p-3" role="alert">
            <CheckCircle className="me-2 text-success" style={{ width: '1.5rem', height: '1.5rem' }} />
            <div>
              ¡Felicidades! Ya realizaste tu primera venta 🎉
            </div>
          </div>
        )}
        {myStats?.productSales && myStats.productSales.length < 2 && (
          <div className="alert alert-info d-flex align-items-center rounded-3 shadow-sm p-3" role="alert">
            <Rocket className="me-2 text-info" style={{ width: '1.5rem', height: '1.5rem' }} />
            <div>
              Sube 2 nuevos productos para llegar al siguiente nivel 🚀
            </div>
          </div>
        )}

        {/* Nuevo título para la sección de ventas */}
        <h2 className="fs-4 fw-bold mb-0 text-dark">Resumen de Ventas</h2>

        {/* Gráficos de ventas mensuales y top productos */}
        <div className="row g-4">
          <div className="col-lg-6">
            {cumulativeMonthlySales.length > 0 ? (
              <div className="stats-card-minimal">
                <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
                  <TrendingUp className="w-6 h-6 me-2 text-fuchsia-custom" />
                  Ventas Acumuladas Mensuales (Ingresos)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cumulativeMonthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: "Meses", position: "insideBottom", offset: -5 }} />
                    <YAxis tickFormatter={(value) => `$${value}`} label={{ value: 'Ingresos Acumulados (USD)', angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Ingresos Acumulados']} />
                    <Legend />
                    <Line type="monotone" dataKey="cumulativeRevenue" stroke="#FF00FF" strokeWidth={3} name="Ingresos Acumulados" />
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
          </div>

          <div className="col-lg-6">
            {cumulativeProductSalesData.length > 0 ? (
              <div className="stats-card-minimal">
                <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
                  <Package className="w-6 h-6 me-2 text-fuchsia-custom" />
                  Ventas Acumuladas por Producto
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cumulativeProductSalesData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: 'Unidades Acumuladas', angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cumulativeSales" stroke="#00C49F" name="Unidades Acumuladas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="stats-card-minimal text-center p-5">
                <Package className="mx-auto mb-4 text-secondary" style={{ width: '4rem', height: '4rem' }} />
                <h3 className="mt-2 fs-5 fw-bold text-dark">Sin productos vendidos</h3>
                <p className="mt-1 fs-6 text-secondary">
                  No se encontraron productos vendidos para el período seleccionado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nota al final del gráfico de ventas */}
        <div className="alert alert-light border border-gray-200 rounded-3 p-3 d-flex align-items-start">
          <img src="https://placehold.co/24x24/E0E0E0/555555?text=🔒" alt="Candado" className="me-2 mt-1" />
          <p className="mb-0 text-secondary small">
            AECBlock retiene el 50% de cada venta. Los pagos se consolidan mensualmente y se procesan el 5to día hábil del mes. Más detalles en los <a href="/terminosYcondiciones" className="text-fuchsia-custom fw-semibold">Términos del Creador</a>.
          </p>
        </div>
      </div>
    );
  }

  // Determinar si hay datos de ventas relevantes para mostrar
  const hasRelevantData = myStats && (
    myStats.totalOrders > 0 ||
    (myStats.productSales && myStats.productSales.length > 0) ||
    (myStats.monthlySales && myStats.monthlySales.length > 0) ||
    myStats.totalRevenue > 0
  );

  // Renderizado principal
  return (
    <div className="creator-stats-view container-fluid py-4">
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h1 className="stats-title fs-2 fw-bold mb-0">Mis Estadísticas</h1>
          <p className="stats-subtitle text-secondary">Resumen de tu rendimiento como creador.</p>
        </div>
        <div className="col-auto">
          <div className="d-flex align-items-center">
            {/* Filtros de año y mes */}
            <select
              className="form-select me-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Package className="d-inline-block me-2" style={{ width: '1.25rem', height: '1.25rem' }} />
                Mis Productos
                {myStats?.productsPendingReview > 0 && (
                  <span className="badge bg-danger ms-2 rounded-pill">
                    {myStats.productsPendingReview}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

      {loading && (
        <div className="text-center p-5">
          <div className="spinner-border text-fuchsia-custom" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-secondary">Cargando tus estadísticas...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Lógica condicional para mostrar datos o mensajes de ausencia de datos */}
      {!loading && !error && (
        <>
          {hasRelevantData ? (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'products' && (
                <div className="products-table-container">
                  {/* Si hay productSales, muestra la tabla, si no, el mensaje específico de "No hay productos vendidos" */}
                  {myStats.productSales && myStats.productSales.length > 0 ? (
                    <div className="stats-card-minimal p-4">
                      <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
                        <Package className="w-6 h-6 me-2 text-fuchsia-custom" />
                        Detalles de Mis Productos
                      </h3>
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Nombre del Producto</th>
                              <th>Vendedor</th>
                              <th>Ingresos Totales</th>
                              <th>Cantidad Vendida</th>
                              <th># de Órdenes</th>
                              <th>País</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myStats.productSales.map((product) => (
                              <tr key={product.productId}>
                                <td>{product.productId}</td>
                                <td>{product.productName}</td>
                                <td>{product.uploaderUsername}</td>
                                <td>{formatCurrency(product.totalSales)}</td>
                                <td>{product.totalQuantity}</td>
                                <td>{product.ordersCount}</td>
                                <td>{product.country}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="stats-card-minimal text-center p-5">
                      <Package className="mx-auto mb-4 text-secondary" style={{ width: '4rem', height: '4rem' }} />
                      <h3 className="mt-2 fs-5 fw-bold text-dark">No hay productos vendidos</h3>
                      <p className="mt-1 fs-6 text-secondary">
                        Parece que aún no tienes productos vendidos en este período.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // Si no hay datos relevantes de ventas
            <div className="stats-card-minimal text-center p-5">
              <MessageSquare className="mx-auto mb-4 text-secondary" style={{ width: '4rem', height: '4rem' }} />
              {/* Determina el mensaje específico según si myStats es null (no se cargaron datos) o simplemente no tiene ventas */}
              {myStats === null ? (
                <>
                  <h3 className="mt-2 fs-5 fw-bold text-dark">Sin datos disponibles</h3>
                  <p className="mt-1 fs-6 text-secondary">
                    No se encontraron datos para el período de tiempo seleccionado.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-2 fs-5 fw-bold text-dark">Aún no has realizado una venta</h3>
                  <p className="mt-1 fs-6 text-secondary">
                    Cuando tengas tu primera venta, los datos de tus estadísticas se mostrarán aquí.
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreatorStatsView;