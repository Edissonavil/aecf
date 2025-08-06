// src/pages/CollaboratorStatsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ShoppingBag, Package, TrendingUp,
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

  // Calcular próxima fecha de pago (estimada al último día hábil del mes siguiente)
  const getNextPaymentDate = () => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // Mes actual (0-11) + 1

    // Si ya pasó el último día hábil del mes actual, el pago es el próximo mes
    if (today.getDate() > 25) { // Asumimos que el "último día hábil" es alrededor del 25 para estimar al mes siguiente
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    // Calcular el último día del mes
    const lastDayOfMonth = new Date(year, month, 0);
    let day = lastDayOfMonth.getDate();

    // Ajustar al último día hábil (viernes si es fin de semana)
    if (lastDayOfMonth.getDay() === 0) { // Domingo
      day -= 2;
    } else if (lastDayOfMonth.getDay() === 6) { // Sábado
      day -= 1;
    }

    const paymentDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
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
    // Buscar el país en los productos si están cargados, si no, 'N/A'
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
  const OverviewTab = () => {
    // Calcular ingresos netos (50% del total)
    const netRevenue = (myStats?.totalRevenue || 0) * 0.5;
    // Calcular productos por revisar (asumiendo que hay un campo 'productsUnderReview' en myStats o se puede inferir)
    // Por ahora, lo dejamos en 0 o un valor de ejemplo si no hay datos reales
    const productsUnderReview = myStats?.productsUnderReview || 0; // Asumiendo que el backend envía este dato

    return (
      <div className="d-grid gap-4">
        <CollaboratorInfo />

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
              value={myStats?.totalOrders?.toLocaleString()}
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
              value={productsUnderReview.toLocaleString()}
              icon={Package}
              color="orange"
              subtitle="Pendientes de aprobación"
            />
          </div>
        </div>

        {/* Mensajes motivadores/callouts */}
        {myStats?.totalOrders > 0 && (
          <div className="alert alert-success d-flex align-items-center rounded-3 shadow-sm p-3" role="alert">
            <CheckCircle className="me-2 text-success" style={{ width: '1.5rem', height: '1.5rem' }} />
            <div>
              ¡Felicidades! Ya realizaste tu primera venta 🎉
            </div>
          </div>
        )}
        {myProducts.length < 2 && ( // Ejemplo: si tienes menos de 2 productos activos
          <div className="alert alert-info d-flex align-items-center rounded-3 shadow-sm p-3" role="alert">
            <Rocket className="me-2 text-info" style={{ width: '1.5rem', height: '1.5rem' }} />
            <div>
              Sube 2 nuevos productos para llegar al siguiente nivel 🚀
            </div>
          </div>
        )}
        {/* Este mensaje es más general, se puede mostrar siempre */}
        <div className="alert alert-warning d-flex align-items-center rounded-3 shadow-sm p-3" role="alert">
          <MessageSquare className="me-2 text-warning" style={{ width: '1.5rem', height: '1.5rem' }} />
          <div>
            Recuerda responder los comentarios o preguntas de tus compradores.
          </div>
        </div>

        {/* Nuevo título para la sección de ventas */}
        <h2 className="fs-4 fw-bold mb-0 text-dark">Resumen de Ventas</h2>

        {/* Gráficos de ventas mensuales y top productos */}
        <div className="row g-4">
          <div className="col-lg-6">
            {myStats && myStats.monthlySales && myStats.monthlySales.length > 0 ? (
              <div className="stats-card-minimal">
                <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
                  <TrendingUp className="w-6 h-6 me-2 text-fuchsia-custom" />
                  Ventas Mensuales (Ingresos)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={myStats.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: "Meses", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: 'Ingresos (USD)', angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#FF00FF" name="Ingresos" />
                  </BarChart>
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
            {myStats?.productSales && myStats.productSales.length > 0 ? (
              <div className="stats-card-minimal">
                <h3 className="card-title fs-5 fw-bold mb-4 d-flex align-items-center text-dark">
                  <Package className="w-6 h-6 me-2 text-fuchsia-custom" />
                  Mis Productos Más Vendidos
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={myStats.productSales.slice(0, 5)}> {/* Mostrar top 5 */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSales" fill="#00C49F" name="Unidades Vendidas" />
                  </BarChart>
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
            AECBlock retiene el 50% de cada venta. Los pagos se consolidan mensualmente y se procesan el último día hábil del mes. Más detalles en los <a href="#" className="text-fuchsia-custom fw-semibold">Términos del Creador</a>.
          </p>
        </div>

      </div>
    );
  }
};

export default CreatorStatsView;