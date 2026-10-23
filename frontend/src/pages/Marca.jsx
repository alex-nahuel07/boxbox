import Logo from '../components/Logo';
import { PHOTOS } from '../photos';

// Identidad de marca + práctica de colorimetría (círculo cromático RYB)
const C = {
  amarillo: ['Amarillo', '#FFC300'],
  amarilloNaranja: ['Amarillo-naranja', '#FFA200'],
  naranja: ['Naranja', '#FF7A00'],
  rojoNaranja: ['Rojo-naranja', '#F2420A'],
  rojo: ['Rojo', '#E10600'],
  rojoVioleta: ['Rojo-violeta', '#A3195B'],
  violeta: ['Violeta', '#6B2FA0'],
  azulVioleta: ['Azul-violeta', '#3B2E9E'],
  azul: ['Azul', '#1E3FA8'],
  azulVerde: ['Azul-verde', '#138A8A'],
  verde: ['Verde', '#1F9D55'],
  amarilloVerde: ['Amarillo-verde', '#9BC53D'],
};
const WHEEL = Object.values(C);

const PALETA = [
  { nombre: 'Negro Carbono', hex: '#15151E', rgb: '21, 21, 30', uso: '60% · Fondos, encabezados, texto', claro: true },
  { nombre: 'Blanco Pista', hex: '#F4F4F6', rgb: '244, 244, 246', uso: '30% · Superficies y lectura' },
  { nombre: 'Rojo Largada', hex: '#E10600', rgb: '225, 6, 0', uso: '10% · Color de marca, botones, acciones', claro: true },
  { nombre: 'Amarillo Bandera', hex: '#FFC300', rgb: '255, 195, 0', uso: 'Acento · Alertas y destacados' },
  { nombre: 'Gris Asfalto', hex: '#38383F', rgb: '56, 56, 63', uso: 'Soporte · Bordes y texto secundario', claro: true },
];

function Sw({ c, label = true }) {
  return (
    <div className="sw">
      <div className="sw-box" style={{ background: c[1] }} title={`${c[0]} ${c[1]}`} />
      {label && <span>{c[0]}<br /><code>{c[1]}</code></span>}
    </div>
  );
}

function Wheel() {
  const R = 100, r = 58;
  const pt = (rad, a) => [110 + rad * Math.cos(a), 110 + rad * Math.sin(a)];
  return (
    <svg viewBox="0 0 220 220" className="wheel" role="img" aria-label="Círculo cromático de 12 colores">
      {WHEEL.map(([name, hex], i) => {
        const a0 = ((i * 30 - 105) * Math.PI) / 180;
        const a1 = (((i + 1) * 30 - 105) * Math.PI) / 180;
        const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0);
        return (
          <path key={name} d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 0 0 ${x3} ${y3} Z`} fill={hex} stroke="var(--bg)" strokeWidth="1.5">
            <title>{name} {hex}</title>
          </path>
        );
      })}
      {/* Triángulo de primarios y secundarios, como en la hoja de práctica */}
      <polygon points={[0, 4, 8].map((i) => pt(r - 4, ((i * 30 + 15 - 105) * Math.PI) / 180).join(',')).join(' ')} fill="none" stroke="var(--muted)" strokeWidth="1" />
      <polygon points={[2, 6, 10].map((i) => pt(r - 4, ((i * 30 + 15 - 105) * Math.PI) / 180).join(',')).join(' ')} fill="none" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

export default function Marca() {
  return (
    <div className="container page brand">
      <header className="brand-hero card">
        <Logo size={72} />
        <div>
          <span className="eyebrow">Identidad de la empresa</span>
          <h1>BOX BOX Store</h1>
          <p className="lead">“Entrá a boxes. Salí con estilo.”</p>
        </div>
      </header>

      <section className="brand-grid">
        <div className="card">
          <h3>¿Quiénes somos?</h3>
          <p>
            BOX BOX es una tienda online de indumentaria y coleccionables de automovilismo para fanáticos de la
            Fórmula 1 de Argentina. El nombre viene de la orden por radio <i>“box, box”</i> con la que el ingeniero
            llama al piloto a boxes: nuestra idea es que cada visita a la tienda sea esa parada rápida.
          </p>
        </div>
        <div className="card">
          <h3>Misión</h3>
          <p>Acercar a los fanáticos productos de calidad de sus escuderías favoritas con una compra rápida, segura y en cuotas, con envío a todo el país.</p>
          <h3>Visión</h3>
          <p>Ser la tienda de referencia del motorsport en Latinoamérica para 2030.</p>
        </div>
        <div className="card">
          <h3>Valores</h3>
          <ul className="values">
            <li><b>Velocidad</b> — compras y envíos ágiles, como una parada en boxes.</li>
            <li><b>Pasión</b> — somos fanáticos vendiéndole a fanáticos.</li>
            <li><b>Precisión</b> — stock real y precios claros.</li>
            <li><b>Confianza</b> — datos protegidos y pagos seguros.</li>
          </ul>
        </div>
        <div className="card">
          <h3>Público objetivo</h3>
          <p>Personas de 16 a 45 años, seguidoras de la F1 (impulsadas por series y streaming), que compran desde el celular y valoran pagar en cuotas.</p>
          <h3>Tono de voz</h3>
          <p>Cercano, enérgico y con jerga de paddock: “largada”, “vuelta rápida”, “a boxes”.</p>
        </div>
      </section>

      <section className="card">
        <h2>Logotipo</h2>
        <div className="logo-show">
          <div className="logo-tile dark"><Logo size={56} /></div>
          <div className="logo-tile light"><Logo size={56} /></div>
          <div className="logo-tile red"><Logo size={56} showText={false} /></div>
        </div>
        <p className="muted">
          Isotipo: dos chevrones inclinados en Rojo Largada que sugieren movimiento hacia adelante (como las flechas
          de entrada a boxes) sobre una base Amarillo Bandera que representa la línea de pit lane. Logotipo en Titillium
          Web Black Italic: la cursiva transmite velocidad.
        </p>
      </section>

      <section className="card">
        <h2>Paleta de colores (regla 60 · 30 · 10)</h2>
        <div className="palette">
          {PALETA.map((p) => (
            <div key={p.hex} className="pal" style={{ background: p.hex, color: p.claro ? '#fff' : '#15151E' }}>
              <strong>{p.nombre}</strong>
              <code>{p.hex}</code>
              <small>RGB {p.rgb}</small>
              <small>{p.uso}</small>
            </div>
          ))}
        </div>
        <div className="psico">
          <p><b>Rojo:</b> pasión, energía y velocidad; es el color histórico del automovilismo y genera urgencia en los botones de compra.</p>
          <p><b>Negro:</b> elegancia y tecnología (fibra de carbono); hace resaltar los productos.</p>
          <p><b>Amarillo:</b> atención, como las banderas de pista; se usa solo para avisos y detalles.</p>
          <p><b>Blanco:</b> claridad y orden para leer precios y descripciones.</p>
        </div>
      </section>

      <section className="card">
        <h2>Tipografía</h2>
        <div className="type-grid">
          <div>
            <p className="type-sample display">Titillium Web Black Italic</p>
            <p className="muted small">Títulos y logotipo · Google Fonts · Licencia OFL</p>
          </div>
          <div>
            <p className="type-sample">Titillium Web Regular / SemiBold</p>
            <p className="muted small">Texto, precios y botones. Geométrica, de origen técnico, muy legible en pantallas.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Colorimetría — hoja de práctica</h2>
        <div className="sheet">
          <div className="sheet-wheel"><Wheel /></div>
          <div className="sheet-block">
            <h4>Colores primarios</h4>
            <div className="sw-row">{[C.rojo, C.amarillo, C.azul].map((c) => <Sw key={c[0]} c={c} />)}</div>
            <h4>Colores secundarios</h4>
            {[[C.rojo, C.amarillo, C.naranja], [C.amarillo, C.azul, C.verde], [C.azul, C.rojo, C.violeta]].map(([a, b, r]) => (
              <div key={r[0]} className="sw-row eq">
                <Sw c={a} /> <span className="op">+</span> <Sw c={b} /> <span className="op">=</span> <Sw c={r} />
              </div>
            ))}
          </div>
          <div className="sheet-block">
            <h4>Análogos <small className="muted">(vecinos en el círculo)</small></h4>
            <div className="sw-row">{[C.rojoVioleta, C.rojo, C.rojoNaranja].map((c) => <Sw key={c[0]} c={c} />)}</div>
            <h4>Monocromático <small className="muted">(Rojo Largada)</small></h4>
            <div className="sw-row">
              {[['Sombra 2', '#4D0200'], ['Sombra 1', '#8F0400'], ['Base', '#E10600'], ['Luz 1', '#FF5C55'], ['Luz 2', '#FFC2BF']].map((c) => <Sw key={c[1]} c={c} />)}
            </div>
          </div>
        </div>
        <h4>Terciarios</h4>
        <div className="sw-row">
          {[C.amarilloNaranja, C.rojoNaranja, C.rojoVioleta, C.azulVioleta, C.azulVerde, C.amarilloVerde].map((c) => <Sw key={c[0]} c={c} />)}
        </div>
        <div className="sheet-bottom">
          <div>
            <h4>Complementarios</h4>
            <div className="sw-row">{[C.rojo, C.verde].map((c) => <Sw key={c[0]} c={c} />)}</div>
          </div>
          <div>
            <h4>Colores cálidos</h4>
            <div className="sw-row">{[C.rojo, C.naranja, C.amarillo].map((c) => <Sw key={c[0]} c={c} />)}</div>
          </div>
          <div>
            <h4>Colores fríos</h4>
            <div className="sw-row">{[C.azul, C.verde, C.violeta].map((c) => <Sw key={c[0]} c={c} />)}</div>
          </div>
        </div>
        <p className="muted small">
          La marca se apoya en colores cálidos (rojo y amarillo, que transmiten energía). Los complementarios del rojo
          (verdes) no se usan en la interfaz para no competir con los botones de compra; solo aparecen como color de
          “éxito” en mensajes de pago aprobado.
        </p>
      </section>

      <section className="card">
        <h2>Mockup</h2>
        <p className="muted">Vista del sitio en escritorio y celular (diseño responsive).</p>
        <div className="mockups">
          <div className="device desktop">
            <div className="device-bar"><i /><i /><i /></div>
            <iframe title="Mockup escritorio" src="/" loading="lazy" />
          </div>
          <div className="device phone">
            <iframe title="Mockup celular" src="/tienda" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="card" id="creditos">
        <h2>Créditos fotográficos</h2>
        <p className="muted small">
          Fotografías de Fórmula 1 publicadas en Unsplash bajo la licencia Unsplash (uso gratuito, incluso comercial).
        </p>
        <div className="credits">
          {Object.entries(PHOTOS).map(([src, [autor, usuario, id]]) => (
            <a key={src} href={`https://unsplash.com/photos/${id}`} target="_blank" rel="noreferrer" className="credit">
              <img src={src} alt="" loading="lazy" />
              <span>{src.split('/').pop()}<br /><b>{autor}</b> · @{usuario}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
