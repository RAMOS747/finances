import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { dashboard } from '../api/api';

// ── Días de la semana en español (índice 0=Dom … 6=Sáb) ────────
const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * "2026-05-26" → "Lun"
 * T12:00:00 evita desfase de zona horaria
 */
function fechaADia(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00');
  return DIAS_ES[d.getDay()];
}

// ── Formatear moneda COP ────────────────────────────────────────
function fmt(n) {
  return Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}

// ── Tooltip personalizado ───────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,4,28,0.93)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8,
      padding: '8px 13px',
      color: '#fff',
      fontSize: '1.3rem', //Aumenta el tamaño del mensaje al poner el cursor
    }}>
      {label && <div style={{ marginBottom: 3, color: 'rgba(255,255,255,0.55)', fontSize:'0.78rem' }}>{label}</div>}
      <strong>{payload[0].name ?? 'Total'}</strong>: $ {fmt(payload[0].value)}
    </div>
  );
}




// ── Labels en Pastel / Anillo ───────────────────────────────────
function renderLabel({ name, percent }) {
  if (percent < 0.05) return null;
  return `${name} ${(percent * 100).toFixed(0)}%`;
}

// ════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function Dashboard({ onBack }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.getData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Cargando ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dash-page">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <p style={{ paddingTop: 80, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
          Cargando dashboard…
        </p>
      </div>
    );
  }

  // ── Datos para Pastel y Anillo (por categoría) ──────────────
  const toChartCat = arr =>
    (arr ?? [])
      .filter(d => parseFloat(d.total) > 0)
      .map(d => ({ name: d.nombre, value: parseFloat(d.total), fill: d.color }));

  const gastosCategoria   = toChartCat(data?.gastos);
  const ingresosCategoria = toChartCat(data?.ingresos);

  // ── Datos para Lineal (gastos por día) ──────────────────────
  const gastosPorDia = (data?.gastos_por_dia ?? []).map(d => ({
    dia:   fechaADia(d.fecha),
    value: parseFloat(d.total),
  }));

  // ── Datos para Barras (ingresos por día) ────────────────────
  const ingresosPorDia = (data?.ingresos_por_dia ?? []).map(d => ({
    dia:   fechaADia(d.fecha),
    value: parseFloat(d.total),
  }));






  // ── Estilos reutilizables ───────────────────────────────────
  const tickStyle = { fill: 'rgba(255,255,255,0.55)', fontSize: 25, }; //aumtenta el tamaño de los ticks (días en los ejes)
  const gridStyle = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.08)' };
  const CHART_H   = 210;
  const MARGIN    = { top: 20, right: 0, left: 100, bottom: 3 }; //Mueve las tablas lineal, barras





  // ── YAxis compartido para barras y lineal ───────────────────
  const yAxisProps = {
    tick: tickStyle,
    tickLine: false,
    axisLine: false,
    tickFormatter: v => `${fmt(v)}`, //da el formato para quese reprecente los valores en los graficos de lineal, barras y el tooltip
    //domain: [0, 4],
    //ticks: [0, 1, 2, 3, 4],
  };

  // ── XAxis base compartido ───────────────────────────────────
  const xAxisBase = {
    dataKey: 'dia',
    tick: tickStyle,
    tickLine: false,
    axisLine: { stroke: 'rgba(255,255,255,0.1)' },
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="dash-page">
      <button className="btn-back" onClick={onBack}>← Volver</button>

      {/* Encabezado */}
      <div className="dash-header">
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-subtitle">Gastos e Ingresos de la Última Semana</p>
      </div>

      {/* Tarjetas de totales */}
      <div className="dash-cards-row">
        <div className="dash-summary-card">
          <span className="dsc-label">Gastos semanales</span>
          <span className="dsc-amount">$ {fmt(data?.total_gastos ?? 0)}</span>
        </div>
        <div className="dash-summary-card">
          <span className="dsc-label">Ingresos semanales</span>
          <span className="dsc-amount">$ {fmt(data?.total_ingresos ?? 0)}</span>
        </div>
      </div>

      {/* Grid 2×2 de gráficos */}
      <div className="dash-grid">



        {/* ── 1. GASTOS → Pastel (por categoría) ─────────── */}
        <div className="dash-panel">
          <p className="dash-panel-title">Grafico de Pastel</p>
          {gastosCategoria.length === 0
            ? <p className="dash-empty">Sin datos de gastos</p>
            : (
              <ResponsiveContainer width="100%" height={CHART_H + 60}> 
                <PieChart>
                  <Pie
                    data={gastosCategoria}
                    cx="50%" cy="50%"
                    outerRadius={70} // Radio del pastel
                    dataKey="value"
                    label={renderLabel}
                    labelLine={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }}
                    fontSize={25} //Aumenta el tamaño de las etiquetas de las categorias del pastel
                  >
                    {gastosCategoria.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>




        {/* ── 2. INGRESOS → Barras (por día) ─────────────── */}
        <div className="dash-panel">
          <p className="dash-panel-title">Grafico de barras</p>
          {ingresosPorDia.length === 0
            ? <p className="dash-empty">Sin datos de ingresos</p>
            : (
              <ResponsiveContainer width="100%" height={CHART_H} > 
                <BarChart data={ingresosPorDia} margin={MARGIN}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis {...xAxisBase} />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" name="Ingreso" radius={[5, 5, 0, 0]} fill="#1a8080" barSize={40} />//Aumenta el tamaño de las barras de ingresos y les da bordes redondeados en la parte superior
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* ── 3. GASTOS → Lineal (por día) ────────────────── */}
        <div className="dash-panel">
          <p className="dash-panel-title">Grafico lineal</p>
          {gastosPorDia.length === 0
            ? <p className="dash-empty">Sin datos de gastos</p>
            : (
              <ResponsiveContainer width="100%" height={CHART_H} >
                <LineChart data={gastosPorDia} margin={MARGIN} >
                  <CartesianGrid {...gridStyle} />
                  <XAxis
                    {...xAxisBase}
                    padding={{ left: 40, right: 40 }} // Agrega espacio a los lados para las 9 líneas verticales
                  />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Gasto"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{ fill: '#a855f7', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#c084fc' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* ── 4. INGRESOS → Anillo (por categoría) ────────── */}
        <div className="dash-panel">
          <p className="dash-panel-title">Grafico de anillo</p>
          {ingresosCategoria.length === 0
            ? <p className="dash-empty">Sin datos de ingresos</p>
            : (
              <ResponsiveContainer width="100%" height={CHART_H + 60}>
                <PieChart>
                  <Pie
                    data={ingresosCategoria}
                    cx="50%" cy="50%"
                    innerRadius={40}
                    outerRadius={70} // Radio del anillo
                    paddingAngle={3}
                    dataKey="value"
                    label={renderLabel}
                    labelLine={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }}
                    fontSize={25}
                  >
                    {ingresosCategoria.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

      </div>{/* /dash-grid */}
    </div>
  );
}