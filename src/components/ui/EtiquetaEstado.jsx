import { ESTADOS } from '../../data/seed.js'

/** Chip de estado de una reserva: Confirmada · En atención · Cancelada */
export default function EtiquetaEstado({ estado, children }) {
  return <span className={`etiqueta etiqueta--${estado}`}>{children ?? ESTADOS[estado]}</span>
}
