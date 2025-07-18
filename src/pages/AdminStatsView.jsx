// src/pages/AdminStatsView.jsx
import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function AdminStatsView() {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(false)
  const base = process.env.REACT_APP_STATS_URL || 'http://localhost:8086'
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    setLoading(true)
    axios.get(`${base}/api/stats/admin/product-stats?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setStats(res.data))
    .catch(() => setStats([]))
    .finally(() => setLoading(false))
  }, [month, base, token])

 // Convertimos cada objeto a un registro plano:
 const chartData = useMemo(() => 
     stats.map(s => ({
     productName: s.productName,
     totalSold: s.totalSold,
     ...s.byPaymentMethod
   }))
 , [stats])


 const paymentMethods = useMemo(
   () => Array.from(new Set(stats.flatMap(s => Object.keys(s.byPaymentMethod || {})))),
   [stats]
 )

  return (
    <div className="container my-4">
      <h1 className="h4 mb-3">Estadísticas globales de productos</h1>
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
        <p className="text-center">No hay datos para este mes.</p>
      )}

      {!loading && stats.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
         <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="totalSold" name="Unidades Vendidas" dot={false} />

            {paymentMethods.map(method => (
              <Line
                key={method}
              dataKey={method}
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

