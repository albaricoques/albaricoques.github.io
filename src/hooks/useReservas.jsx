import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { RESERVAS_INICIALES, BLOQUEOS_INICIALES } from '../data/seed.js'
import { siguienteCodigo } from '../utils/disponibilidad.js'

const CLAVE = 'la-sobremesa:v1'
const ReservasContext = createContext(null)

function cargar() {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(CLAVE))
    if (guardado && Array.isArray(guardado.reservas) && Array.isArray(guardado.bloqueos)) return guardado
  } catch {
    /* sin almacenamiento o datos corruptos: se usan los datos de demo */
  }
  return { reservas: RESERVAS_INICIALES, bloqueos: BLOQUEOS_INICIALES }
}

export function ReservasProvider({ children }) {
  // useState: estado central de las reservas
  const [datos, setDatos] = useState(cargar)

  // useEffect: persiste los cambios para que la agenda sobreviva a una recarga
  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(datos))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [datos])

  const crearReserva = useCallback((nueva) => {
    let creada
    setDatos((d) => {
      creada = { ...nueva, codigo: siguienteCodigo(d.reservas), estado: nueva.estado ?? 'confirmada' }
      return { ...d, reservas: [...d.reservas, creada] }
    })
    return creada
  }, [])

  const actualizarReserva = useCallback((codigo, cambios) => {
    setDatos((d) => ({ ...d, reservas: d.reservas.map((r) => (r.codigo === codigo ? { ...r, ...cambios } : r)) }))
  }, [])

  const cancelarReserva = useCallback((codigo) => actualizarReserva(codigo, { estado: 'cancelada' }), [actualizarReserva])

  const reiniciarDatos = useCallback(() => {
    setDatos({ reservas: RESERVAS_INICIALES, bloqueos: BLOQUEOS_INICIALES })
  }, [])

  const valor = useMemo(
    () => ({ ...datos, crearReserva, actualizarReserva, cancelarReserva, reiniciarDatos }),
    [datos, crearReserva, actualizarReserva, cancelarReserva, reiniciarDatos],
  )

  return <ReservasContext.Provider value={valor}>{children}</ReservasContext.Provider>
}

export function useReservas() {
  const ctx = useContext(ReservasContext)
  if (!ctx) throw new Error('useReservas debe usarse dentro de <ReservasProvider>')
  return ctx
}
