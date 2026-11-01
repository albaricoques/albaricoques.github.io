import { useEffect, useState } from 'react'
import { DIAS_CORTOS, MESES, aFecha, clave, fechaSeleccionada, matrizMes } from '../../utils/fechas.js'

const CABECERA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MES_NOMBRE = (m) => MESES[m].charAt(0).toUpperCase() + MESES[m].slice(1)

/**
 * Calendario interactivo (Calendario expandido). Navega por meses, marca el día
 * seleccionado y subraya los días con reservas.
 */
export default function Calendario({ fecha, onSeleccionar, diasConReservas, amplio = false, mostrarSeleccion = true }) {
  const f = aFecha(fecha)
  const [vista, setVista] = useState({ anio: f.getFullYear(), mes: f.getMonth() })

  // useEffect: si la fecha cambia desde otro control (select, alternativa…), el calendario salta a ese mes
  useEffect(() => {
    const d = aFecha(fecha)
    setVista({ anio: d.getFullYear(), mes: d.getMonth() })
  }, [fecha])

  const mover = (delta) =>
    setVista(({ anio, mes }) => {
      const d = new Date(anio, mes + delta, 1)
      return { anio: d.getFullYear(), mes: d.getMonth() }
    })

  const semanas = matrizMes(vista.anio, vista.mes)

  return (
    <div className={`calendario ${amplio ? 'calendario--amplio' : ''}`.trim()}>
      <div className="calendario__cabecera">
        <button type="button" className="calendario__nav" onClick={() => mover(-1)} aria-label="Mes anterior">‹</button>
        <h3 className="calendario__titulo" aria-live="polite">{MES_NOMBRE(vista.mes)} {vista.anio}</h3>
        <button type="button" className="calendario__nav" onClick={() => mover(1)} aria-label="Mes siguiente">›</button>
      </div>
      <table className="calendario__tabla">
        <thead>
          <tr>{CABECERA.map((d, i) => <th key={d + i} scope="col" abbr={DIAS_CORTOS[(i + 1) % 7]}>{d}</th>)}</tr>
        </thead>
        <tbody>
          {semanas.map((sem, i) => (
            <tr key={i}>
              {sem.map((dia, j) => {
                if (!dia) return <td key={j} />
                const iso = clave(vista.anio, vista.mes, dia)
                const activo = iso === fecha
                const conReservas = diasConReservas?.has(iso)
                return (
                  <td key={j}>
                    <button
                      type="button"
                      className={`calendario__dia ${activo ? 'calendario__dia--activo' : ''} ${conReservas && !activo ? 'calendario__dia--con-reservas' : ''}`.trim()}
                      onClick={() => onSeleccionar(iso)}
                      aria-pressed={activo}
                      aria-label={fechaSeleccionada(iso)}
                    >
                      {dia}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {mostrarSeleccion && <p className="calendario__seleccion">Seleccionado: {fechaSeleccionada(fecha)}</p>}
    </div>
  )
}
