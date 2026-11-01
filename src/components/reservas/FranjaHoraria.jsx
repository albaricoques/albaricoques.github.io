import Icono from '../ui/Icono.jsx'

/**
 * Chip de franja horaria: disponible · solicitado/agotado · seleccionado.
 * `estado`: 'disponible' | 'agotada' | 'seleccionada'
 */
export default function FranjaHoraria({ hora, estado = 'disponible', solicitada = false, onSeleccionar, compacta = false }) {
  const texto = {
    disponible: 'Disponible',
    agotada: solicitada ? 'Solicitado · Agotado' : 'Agotado',
    seleccionada: 'Seleccionado',
  }[estado]
  const clases = ['franja', estado !== 'disponible' && `franja--${estado}`, compacta && 'franja--compacta'].filter(Boolean).join(' ')
  return (
    <button
      type="button"
      className={clases}
      onClick={() => onSeleccionar?.(hora)}
      disabled={estado === 'agotada' && !solicitada}
      aria-pressed={estado === 'seleccionada' || (estado === 'agotada' && solicitada)}
    >
      <span className="franja__hora">{hora}</span>
      <span className="franja__estado">
        {estado === 'seleccionada' && <Icono nombre="check" tamano={12} grosor={2} />}
        {texto}
      </span>
    </button>
  )
}
