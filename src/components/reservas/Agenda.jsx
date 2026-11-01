import { useMemo } from 'react'
import { construirAgenda } from '../../utils/agenda.js'
import { diaMes } from '../../utils/fechas.js'

/** Agenda del día: reservas, mesas ocupadas / sin cupo y mesas libres */
export default function Agenda({ titulo, fecha, reservas, bloqueos, sombra = false }) {
  const items = useMemo(() => construirAgenda({ reservas, bloqueos, fecha }), [reservas, bloqueos, fecha])
  return (
    <section className={`agenda ${sombra ? 'agenda--sombra' : ''}`.trim()} aria-label={titulo ?? 'Agenda'}>
      <h2 className="agenda__titulo">{titulo ?? `Agenda · ${diaMes(fecha)}`}</h2>
      {items.length === 0 ? (
        <p className="agenda__vacia">Sin reservas este día.</p>
      ) : (
        <ul>
          {items.map((i) => (
            <li key={i.id} className={`agenda__fila ${i.conflicto ? 'agenda__fila--conflicto' : ''}`.trim()}>
              <span className="agenda__hora">{i.hora}</span>
              <div>
                <p className="agenda__mesa">{i.mesa}</p>
                <p className="agenda__detalle">{i.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
