export default function Logo({ size = 34, showText = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="12" fill="#15151E" />
        <path d="M10 44 L26 20 H40 L24 44 Z" fill="#E10600" />
        <path d="M28 44 L44 20 H54 L38 44 Z" fill="#E10600" opacity=".55" />
        <rect x="10" y="48" width="44" height="4" fill="#FFC300" />
      </svg>
      {showText && (
        <span className="logo-text">
          BOX<span>BOX</span>
        </span>
      )}
    </span>
  );
}
