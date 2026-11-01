/** Selector numérico con límites: el botón + se deshabilita en el máximo, − en el mínimo */
export default function SelectorNumerico({ valor, min = 1, max = 8, onChange, etiqueta = 'Número' }) {
  return (
    <div className="selector" role="group" aria-label={etiqueta}>
      <button type="button" className="selector__boton" onClick={() => onChange(valor - 1)} disabled={valor <= min} aria-label="Quitar una persona">−</button>
      <output className="selector__valor" aria-live="polite">{valor}</output>
      <button type="button" className="selector__boton selector__boton--mas" onClick={() => onChange(valor + 1)} disabled={valor >= max} aria-label="Añadir una persona">+</button>
    </div>
  )
}
