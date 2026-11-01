const ICONOS = {
  logo: <><path d="M12 21v-9" /><path d="M12 12c0-3.2-2.4-5.5-6-5.5 0 3.2 2.4 5.5 6 5.5z" /><path d="M12 14c0-2.8 2-4.8 5.5-4.8 0 2.8-2 4.8-5.5 4.8z" /><path d="M9 21h6" /></>,
  panel: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  calendario: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
  mas: <path d="M12 5v14M5 12h14" />,
  editar: <><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" /><path d="M18.4 3.6a1.9 1.9 0 0 1 2.7 2.7L12 15.4 8 16l.6-4z" /></>,
  'check-circulo': <><circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.8 2.8L16.2 9.6" /></>,
  'alerta-circulo': <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.2h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8h.01" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  cubiertos: <><path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7a2 2 0 0 1-2 2M8 3v5" /><path d="M17 21V3c-2.2 1.2-3.5 3.7-3.5 7 0 1.4.9 2.5 2 3h1.5" /></>,
  externo: <path d="M7 17 17 7M8 7h9v9" />,
  cerrar: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  'flecha-der': <path d="M5 12h14M13 6l6 6-6 6" />,
  'flecha-izq': <path d="M19 12H5M11 6l-6 6 6 6" />,
}

export default function Icono({ nombre, tamano = 20, grosor = 1.6, className = '' }) {
  return (
    <svg
      className={`icono ${className}`.trim()}
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS[nombre]}
    </svg>
  )
}
