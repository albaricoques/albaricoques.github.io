import { MESAS, HORAS_SERVICIO, BASE_DIA, CUPO_ONLINE_BASE, CUPO_ONLINE_DEFECTO, FECHA_DEMO } from '../data/seed.js'

const activa = (r) => r.estado !== 'cancelada'

export const capacidadMesa = (id) => MESAS.find((m) => m.id === id)?.capacidad ?? 0

/** ¿La mesa está ocupada a esa fecha y hora? `ignorar` evita contar dos veces la reserva que se edita. */
export function mesaOcupada({ reservas, bloqueos = [], fecha, hora, mesa, ignorar }) {
  const porReserva = reservas.some(
    (r) => activa(r) && r.codigo !== ignorar && r.fecha === fecha && r.hora === hora && r.mesa === mesa,
  )
  const porBloqueo = bloqueos.some((b) => b.fecha === fecha && b.hora === hora && b.mesa === mesa)
  return porReserva || porBloqueo
}

export function mesasLibres({ reservas, bloqueos, fecha, hora, personas = 1, ignorar }) {
  return MESAS.filter(
    (m) => m.capacidad >= personas && !mesaOcupada({ reservas, bloqueos, fecha, hora, mesa: m.id, ignorar }),
  )
}

/** Franja más cercana con mesa libre: prefiere la misma mesa, y a igual distancia, la hora posterior. */
export function buscarAlternativa({ reservas, bloqueos, fecha, hora, mesa, personas, ignorar }) {
  const base = HORAS_SERVICIO.indexOf(hora)
  const candidatas = HORAS_SERVICIO.map((h, i) => ({ h, i }))
    .filter(({ h }) => h !== hora)
    .sort((a, b) => Math.abs(a.i - base) - Math.abs(b.i - base) || b.i - a.i)
  for (const { h } of candidatas) {
    const libres = mesasLibres({ reservas, bloqueos, fecha, hora: h, personas, ignorar })
    if (!libres.length) continue
    const misma = libres.find((m) => m.id === mesa)
    const elegida = misma ?? libres[0]
    return { hora: h, mesa: elegida.id, plazas: elegida.capacidad }
  }
  return null
}

export function cupoOnline({ reservas, fecha, hora }) {
  const base = fecha === FECHA_DEMO ? CUPO_ONLINE_BASE[hora] ?? CUPO_ONLINE_DEFECTO : CUPO_ONLINE_DEFECTO
  const usadas = reservas.filter((r) => activa(r) && r.origen === 'web' && r.fecha === fecha && r.hora === hora).length
  return Math.max(0, base - usadas)
}

/** Mesa más ajustada al grupo que esté libre (para reservas hechas por el cliente). */
export function asignarMesa({ reservas, bloqueos, fecha, hora, personas }) {
  const libres = mesasLibres({ reservas, bloqueos, fecha, hora, personas }).sort((a, b) => a.capacidad - b.capacidad)
  return libres[0]?.id ?? null
}

export function estadisticasDia(reservas, fecha) {
  const deldia = reservas.filter((r) => r.fecha === fecha)
  const activas = deldia.filter(activa)
  const canceladas = deldia.length - activas.length
  const esDemo = fecha === FECHA_DEMO
  const base = esDemo ? BASE_DIA : { activas: 0, canceladas: 0, mesasOcupadas: 0, personas: 0 }
  const mesasUsadas = new Set(activas.map((r) => r.mesa)).size
  const personas = activas.reduce((s, r) => s + r.personas, 0) + base.personas
  const plazas = MESAS.reduce((s, m) => s + m.capacidad, 0)
  return {
    total: deldia.length + base.activas + base.canceladas,
    activas: activas.length + base.activas,
    canceladas: canceladas + base.canceladas,
    mesasOcupadas: mesasUsadas + base.mesasOcupadas,
    mesas: MESAS.length,
    personas,
    plazas,
    capacidadRestante: Math.max(0, plazas - personas),
  }
}

export function siguienteCodigo(reservas) {
  const max = reservas.reduce((m, r) => Math.max(m, Number(r.codigo.split('-')[1])), 3040)
  return `SM-${max + 1}`
}

export const validarTelefono = (t) => /^\+\d{1,3}\d{9}$/.test(t.replace(/[\s-]/g, ''))
export const validarCorreo = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)
export const hayTexto = (t) => t.trim().length > 1
