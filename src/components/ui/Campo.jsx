import { useId } from 'react'
import Icono from './Icono.jsx'

/**
 * Campo de formulario: texto, número, select o textarea, con etiqueta,
 * ayuda, mensaje de error y confirmación de validez.
 */
export default function Campo({ etiqueta, requerido = false, tipo = 'texto', opciones = [], ayuda, error, ok, className = '', ...props }) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const comunes = {
    id,
    className: 'campo__control',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || ok || ayuda ? idAyuda : undefined,
    'aria-required': requerido || undefined,
    ...props,
  }

  let control
  if (tipo === 'select') {
    control = (
      <select {...comunes}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor} disabled={o.deshabilitada}>{o.texto}</option>
        ))}
      </select>
    )
  } else if (tipo === 'textarea') {
    control = <textarea {...comunes} />
  } else {
    control = <input type={tipo === 'texto' ? 'text' : tipo} {...comunes} />
  }

  return (
    <div className={`campo ${error ? 'campo--error' : ''} ${className}`.trim()}>
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta}{requerido ? ' *' : ''}
      </label>
      {control}
      {error ? (
        <p id={idAyuda} className="campo__ayuda campo__ayuda--error">{error}</p>
      ) : ok ? (
        <p id={idAyuda} className="campo__ayuda campo__ayuda--ok"><Icono nombre="check" tamano={12} grosor={2} />{ok}</p>
      ) : ayuda ? (
        <p id={idAyuda} className="campo__ayuda">{ayuda}</p>
      ) : null}
    </div>
  )
}
