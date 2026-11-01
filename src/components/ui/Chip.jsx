/** Chip seleccionable: Día/Semana, Teléfono/Presencial, filtros de estado */
export default function Chip({ activo = false, bloque = false, className = '', children, ...props }) {
  const clases = ['chip', activo && 'chip--activo', bloque && 'chip--bloque', className].filter(Boolean).join(' ')
  return (
    <button type="button" className={clases} aria-pressed={activo} {...props}>
      {children}
    </button>
  )
}
