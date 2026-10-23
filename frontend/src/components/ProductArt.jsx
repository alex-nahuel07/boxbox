import { isPhoto } from '../photos';

// Ilustración vectorial del producto según su tipo y el color de la escudería
export const TEAM_COLORS = {
  'Rosso Corsa': ['#DC0000', '#7A0000'],
  'Silver Arrows': ['#00A19B', '#1B1B22'],
  'Papaya Racing': ['#FF8000', '#A34700'],
  'Bull Racing': ['#1E2A5A', '#0B1030'],
  'Green Machine': ['#006F62', '#00332D'],
  'BOX BOX': ['#E10600', '#15151E'],
};

const GLYPHS = {
  cap: (
    <>
      <path d="M22 62 Q22 32 50 32 Q78 32 78 62 Z" />
      <path d="M14 62 H88 Q90 68 82 70 H14 Z" opacity=".85" />
      <circle cx="50" cy="31" r="3" />
    </>
  ),
  shirt: <path d="M30 24 L42 19 Q50 28 58 19 L70 24 L86 38 L76 49 L68 42 V82 H32 V42 L24 49 L14 38 Z" />,
  hoodie: (
    <>
      <path d="M30 30 L40 22 Q50 12 60 22 L70 30 L84 56 L74 60 L68 48 V84 H32 V48 L26 60 L16 56 Z" />
      <path d="M40 66 H60 V76 H40 Z" fill="rgba(0,0,0,.25)" />
    </>
  ),
  car: (
    <>
      <path d="M8 60 L28 52 H44 L52 42 H62 L66 52 L86 53 L90 50 H94 V62 L8 64 Z" />
      <rect x="84" y="40" width="10" height="4" />
      <rect x="4" y="54" width="8" height="10" />
      <circle cx="26" cy="64" r="9" fill="#111" stroke="#fff" strokeWidth="3" />
      <circle cx="76" cy="64" r="9" fill="#111" stroke="#fff" strokeWidth="3" />
    </>
  ),
  helmet: (
    <>
      <path d="M18 64 Q18 26 52 26 Q84 26 84 58 V70 H30 Q18 70 18 64 Z" />
      <path d="M50 42 H82 V56 H54 Q46 50 50 42 Z" fill="#15151E" />
    </>
  ),
  mug: (
    <>
      <rect x="24" y="28" width="40" height="50" rx="5" />
      <path d="M64 38 H72 Q82 38 82 50 Q82 62 72 62 H64 V56 H72 Q76 56 76 50 Q76 44 72 44 H64 Z" />
    </>
  ),
  key: (
    <>
      <path d="M20 40 Q20 30 30 30 H70 Q80 30 80 40 V58 Q80 70 68 70 H32 Q20 70 20 58 Z" />
      <circle cx="50" cy="50" r="8" fill="rgba(0,0,0,.3)" />
      <rect x="30" y="38" width="8" height="5" fill="#FFC300" />
      <rect x="62" y="38" width="8" height="5" fill="#00D2BE" />
    </>
  ),
  flag: (
    <>
      <rect x="22" y="18" width="4" height="66" />
      {[0, 1, 2, 3, 4].flatMap((r) =>
        [0, 1, 2, 3, 4, 5].map((c) =>
          (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={26 + c * 9} y={20 + r * 8} width="9" height="8" /> : null
        )
      )}
    </>
  ),
};

// Si el producto tiene foto (ruta o URL) se muestra la foto; si no, la ilustración vectorial
export default function ProductArt({ imagen, escuderia, alt = '', className = '' }) {
  if (isPhoto(imagen))
    return <img className={`product-art photo ${className}`} src={imagen} alt={alt || escuderia || ''} loading="lazy" />;
  const [a, b] = TEAM_COLORS[escuderia] || TEAM_COLORS['BOX BOX'];
  const id = `g-${(escuderia || 'bb').replace(/\W/g, '')}`;
  return (
    <svg className={`product-art ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={escuderia}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id})`} />
      <path d="M-10 92 L40 -10 H52 L2 92 Z" fill="#fff" opacity=".06" />
      <path d="M60 110 L110 8 V30 L72 110 Z" fill="#fff" opacity=".06" />
      <g fill="#fff" transform="translate(16 16) scale(0.68)">{GLYPHS[imagen] || GLYPHS.cap}</g>
    </svg>
  );
}
