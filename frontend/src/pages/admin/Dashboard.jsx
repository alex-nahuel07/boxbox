import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api';

function Bars({ rows, label, value, format = (v) => v }) {
  const max = Math.max(...rows.map((r) => r[value]), 1);
  return (
    <div className="bars">
      {rows.map((r) => (
        <div key={r[label]} className="bar-row">
          <span className="bar-label">{r[label]}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r[value] / max) * 100}%` }} />
          </div>
          <span className="bar-value">{format(r[value])}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard').then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="alert alert-error">{error}</p>;
  if (!d) return <p>Cargando…</p>;

  const kpis = [
    ['Ventas totales', money(d.ventasTotales)],
    ['Ventas últimos 30 días', money(d.ventasMes)],
    ['Pedidos', d.pedidos, `${d.pedidosPendientes} por despachar`],
    ['Clientes', d.clientes],
    ['Productos activos', d.productos, `${d.stockBajo.length} con stock bajo`],
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="kpis">
        {kpis.map(([label, value, hint]) => (
          <div key={label} className="card kpi">
            <span className="muted small">{label}</span>
            <strong>{value}</strong>
            {hint && <span className="small text-warn">{hint}</span>}
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <section className="card">
          <h3>Ventas por categoría</h3>
          <Bars rows={d.ventasPorCategoria} label="categoria" value="total" format={money} />
        </section>
        <section className="card">
          <h3>Productos más vendidos</h3>
          <Bars rows={d.topProductos} label="nombre" value="unidades" format={(v) => `${v} u.`} />
        </section>
        <section className="card">
          <h3>Ventas por día (30 días)</h3>
          <div className="spark">
            {d.ventasPorDia.map((v) => {
              const max = Math.max(...d.ventasPorDia.map((x) => x.total));
              return (
                <div key={v.dia} className="spark-col" title={`${v.dia}: ${money(v.total)}`}>
                  <div style={{ height: `${(v.total / max) * 100}%` }} />
                  <span>{v.dia.slice(8)}/{v.dia.slice(5, 7)}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card">
          <h3>Alertas de stock</h3>
          {d.stockBajo.length === 0 ? (
            <p className="muted">Todo el stock está por encima del mínimo.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead>
              <tbody>
                {d.stockBajo.map((p) => (
                  <tr key={p.id_producto}>
                    <td>{p.nombre}</td>
                    <td className={p.stock === 0 ? 'danger' : 'text-warn'}><b>{p.stock}</b></td>
                    <td>{p.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link to="/admin/productos" className="small">Gestionar productos →</Link>
        </section>
      </div>
    </>
  );
}
