import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function CreatorStatsView() {
  const [month, setMonth]     = useState(new Date().toISOString().slice(0,7))
  const [stats, setStats]     = useState([])
  const [loading, setLoading] = useState(false)

  const base  = process.env.REACT_APP_STATS_URL || 'http://localhost:8086'
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    setLoading(true)
    fetch(
      `${base}/api/stats/creator/product-stats?month=${month}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => setStats(Array.isArray(data) ? data : []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false))
  }, [month, base, token])

  // extrae todos los métodos de pago que aparecen en los stats
  const paymentMethods = Array.from(
    new Set(stats.flatMap(s => Object.keys(s.byPaymentMethod || {})))
  )

  return (
    <div className="container my-4">
      <h1 className="h4 mb-3">Mis ventas por producto</h1>
      <div className="mb-3">
        <label className="form-label">Mes:</label>
        <input
          type="month"
          className="form-control"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
      </div>

      {loading && <p>Cargando…</p>}

      {!loading && stats.length === 0 && (
        <p className="text-center">No hay datos.</p>
      )}

      {!loading && stats.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={stats}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Total unidades vendidas */}
            <Line
              type="monotone"
              dataKey="totalSold"
              name="Unidades Vendidas"
              dot={false}
            />

            {/* Una línea por cada método de pago */}
            {paymentMethods.map(method => (
              <Line
                key={method}
                type="monotone"
                dataKey={`byPaymentMethod.${method}`}
                name={method}
                dot={false}
              />
            ))}

          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
