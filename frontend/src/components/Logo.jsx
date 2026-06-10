// ── Logo Finances (Triángulo con ojo) ─────────────────────────
export default function Logo({ size = 56, color = '#ffffff' }) {
  return (
    <svg
      className="logo-svg"
      width={size}
      height={size}
      viewBox="0 0 80 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Triángulo principal */}
      <polygon
        points="40,4 76,68 4,68"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Líneas internas (rayos) */}
      <line x1="40" y1="4"  x2="40" y2="18" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="4"  y1="68" x2="16" y2="58" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="76" y1="68" x2="64" y2="58" stroke={color} strokeWidth="1.5" opacity="0.5" />
      {/* Ojo – iris */}
      <ellipse cx="40" cy="46" rx="13" ry="9" stroke={color} strokeWidth="1.8" fill="none" />
      {/* Ojo – pupila */}
      <circle cx="40" cy="46" r="4" fill={color} />
      {/* Brillo del ojo */}
      <circle cx="43" cy="43.5" r="1.5" fill={color} opacity="0.6" />
    </svg>
  );
}
