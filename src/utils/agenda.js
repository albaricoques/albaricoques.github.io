import { ESTADOS } from '../data/seed.js'
import { mesasLibres, cupoOnline } from './disponibilidad.js'
import { aFecha } from './fechas.js'

/** Entradas de la agenda de un día, ordenadas por hora y mesa */
export function construirAgenda({ reservas, bloqueos, fecha }) {
  const items = []
  reservas
    .filter((r) => r.fecha === fecha && r.estado !== 'cancelada')
    .forEach((r) =>
      items.push({ id: r.codigo, hora: r.hora, mesa: r.mesa, detalle: `${r.cliente.split(' ')[0]} · ${ESTADOS[r.estado]}` }),
    )
  bloqueos
    .filter((b) => b.fecha === fecha)
    .forEach((b) => items.push({ id: `b-${b.hora}-${b.mesa}`, hora: b.hora, mesa: b.mesa, detalle: b.motivo, conflicto: true }))

  // Sugerencia de mesa libre en la primera franja con reservas posterior a la primera ocupada
  if (items.length) {
    const horas = [...new Set(items.map((i) => i.hora))].sort()
    const hora = horas[horas.length > 2 ? 2 : horas.length - 1]
    const libre = mesasLibres({ reservas, bloqueos, fecha, hora, personas: 4 })[0]
    if (libre) items.push({ id: `l-${hora}-${libre.id}`, hora, mesa: libre.id, detalle: `Libre · ${libre.capacidad} plazas` })
  }
  return items.sort((a, b) => a.hora.localeCompare(b.hora) || a.mesa.localeCompare(b.mesa) || Number(a.id.startsWith('l-')) - Number(b.id.startsWith('l-')))
}

/** Primera reserva confirmada por llegar (las "en atención" ya están sentadas) */
export function proximaLlegada(reservas, fecha) {
  return reservas
    .filter((r) => r.fecha === fecha && r.estado === 'confirmada')
    .sort((a, b) => a.hora.localeCompare(b.hora))[0]
}

/** Reservas activas que comparten mesa y hora */
export function contarSobrecupos(reservas) {
  const vistas = new Set()
  let repetidas = 0
  reservas
    .filter((r) => r.estado !== 'cancelada')
    .forEach((r) => {
      const k = `${r.fecha}|${r.hora}|${r.mesa}`
      if (vistas.has(k)) repetidas++
      vistas.add(k)
    })
  return repetidas
}

export const mesasLibresProximoTurno = (reservas, fecha, hora) => cupoOnline({ reservas, fecha, hora })

/** 20:00 -> 8:00 p. m. */
export function horaAmPm(hora) {
  const [h, m] = hora.split(':').map(Number)
  const sufijo = h >= 12 ? 'p. m.' : 'a. m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`
}

export const minutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/** Contenido .ics para "Guardar en calendario" */
export function crearIcs({ codigo, fecha, hora, personas }) {
  const f = aFecha(fecha)
  const [h, m] = hora.split(':').map(Number)
  const fin = new Date(f.getFullYear(), f.getMonth(), f.getDate(), h + 2, m)
  const fmt = (d) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`
  const inicio = new Date(f.getFullYear(), f.getMonth(), f.getDate(), h, m)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La Sobremesa//Reservas//ES', 'BEGIN:VEVENT',
    `UID:${codigo}@lasobremesa.example`, `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(inicio)}`, `DTEND:${fmt(fin)}`,
    `SUMMARY:Cena en La Sobremesa (${personas} personas)`, `DESCRIPTION:Código de reserva ${codigo}`,
    'LOCATION:Calle del Olivo\\, 12\\, Madrid', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}
