export const PASOS = ['Fecha', 'Personas', 'Datos', 'Resumen', 'Listo']

/** Stepper del flujo de reserva: marca los pasos hechos y el actual */
export default function Stepper({ actual = 0 }) {
  return (
    <ol className="stepper" aria-label="Progreso de la reserva">
      {PASOS.map((p, i) => (
        <li
          key={p}
          className={`stepper__paso ${i < actual ? 'stepper__paso--hecho' : ''} ${i === actual ? 'stepper__paso--actual' : ''}`.trim()}
          aria-current={i === actual ? 'step' : undefined}
        >
          <span className="stepper__barra" />
          {p}
        </li>
      ))}
    </ol>
  )
}
