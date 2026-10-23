import { useState } from 'react';
import { Link } from 'react-router-dom';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { api, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Formateo de los campos de la tarjeta mientras se escribe
const fmtNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const fmtExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const TEST_CARDS = [
  ['4242 4242 4242 4242', 'Aprobada'],
  ['5555 5555 5555 4444', 'Aprobada (Mastercard)'],
  ['4000 0000 0000 0002', 'Rechazada: fondos insuficientes'],
  ['4000 0000 0000 0069', 'Rechazada: tarjeta denunciada'],
];

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '', focus: '' });
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [cuotas, setCuotas] = useState(1);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [pedido, setPedido] = useState(null);

  const set = (field, value) => setCard((c) => ({ ...c, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await api('/pedidos', {
        method: 'POST',
        body: {
          items: items.map(({ id_producto, cantidad }) => ({ id_producto, cantidad })),
          direccion_envio: direccion,
          cuotas,
          tarjeta: { number: card.number, name: card.name, expiry: card.expiry, cvc: card.cvc },
        },
      });
      setPedido(res);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (pedido)
    return (
      <div className="container page empty">
        <div className="success-icon">✓</div>
        <h1>¡Pago aprobado!</h1>
        <p>
          Pedido <strong>#{pedido.id_pedido}</strong> por <strong>{money(pedido.total)}</strong> en {pedido.pago.cuotas} cuota(s).
        </p>
        <p className="muted">
          Tarjeta {pedido.pago.marca_tarjeta} terminada en {pedido.pago.ultimos4} · Código de autorización{' '}
          <code>{pedido.pago.codigo_autorizacion}</code>
        </p>
        <Link to="/mis-pedidos" className="btn">Ver mis pedidos</Link>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="container page empty">
        <h2>No hay productos para pagar</h2>
        <Link to="/tienda" className="btn">Ir a la tienda</Link>
      </div>
    );

  return (
    <div className="container page">
      <h1>Pago</h1>
      <div className="checkout-grid">
        <form className="card pay-form" onSubmit={submit}>
          <div className="card-preview">
            <Cards number={card.number} name={card.name} expiry={card.expiry} cvc={card.cvc} focused={card.focus} locale={{ valid: 'vence' }} placeholders={{ name: 'NOMBRE APELLIDO' }} />
          </div>

          <label>
            Número de tarjeta
            <input className="input" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" required
              value={card.number} onChange={(e) => set('number', fmtNumber(e.target.value))} onFocus={() => set('focus', 'number')} />
          </label>
          <label>
            Nombre del titular
            <input className="input" autoComplete="cc-name" placeholder="Como figura en la tarjeta" required
              value={card.name} onChange={(e) => set('name', e.target.value.toUpperCase())} onFocus={() => set('focus', 'name')} />
          </label>
          <div className="row-2">
            <label>
              Vencimiento
              <input className="input" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" required
                value={card.expiry} onChange={(e) => set('expiry', fmtExpiry(e.target.value))} onFocus={() => set('focus', 'expiry')} />
            </label>
            <label>
              CVC
              <input className="input" inputMode="numeric" autoComplete="cc-csc" placeholder="123" required
                value={card.cvc} onChange={(e) => set('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                onFocus={() => set('focus', 'cvc')} onBlur={() => set('focus', '')} />
            </label>
          </div>
          <div className="row-2">
            <label>
              Cuotas
              <select className="input" value={cuotas} onChange={(e) => setCuotas(Number(e.target.value))}>
                {[1, 3, 6, 12].map((n) => (
                  <option key={n} value={n}>{n} x {money(total / n)}{n > 1 ? ' sin interés' : ''}</option>
                ))}
              </select>
            </label>
            <label>
              Dirección de envío
              <input className="input" required value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, ciudad" />
            </label>
          </div>

          {error && <p className="alert alert-error">{error}</p>}
          <button className="btn btn-lg btn-block" disabled={sending}>
            {sending ? 'Procesando pago…' : `Pagar ${money(total)}`}
          </button>
          <p className="muted small center">🔒 Pago simulado: no se realiza ningún cobro real ni se guarda el número de tarjeta.</p>
        </form>

        <aside>
          <div className="card summary">
            <h3>Tu pedido</h3>
            {items.map((i) => (
              <div key={i.id_producto} className="sum-row">
                <span>{i.cantidad} × {i.nombre}</span>
                <span>{money(i.precio * i.cantidad)}</span>
              </div>
            ))}
            <div className="sum-row total"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <div className="card summary test-cards">
            <h3>Tarjetas de prueba</h3>
            <p className="muted small">Usá cualquier nombre, un vencimiento futuro y CVC de 3 dígitos.</p>
            {TEST_CARDS.map(([n, label]) => (
              <button key={n} type="button" className="test-card" onClick={() => setCard((c) => ({ ...c, number: n, focus: 'number' }))}>
                <code>{n}</code>
                <span className="muted small">{label}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
