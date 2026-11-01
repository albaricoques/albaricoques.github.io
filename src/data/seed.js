export const FECHA_DEMO = '2026-10-30'

export const RESTAURANTE = {
  nombre: 'La Sobremesa',
  lema: 'Cocina de temporada, sin prisas',
  direccion: 'Calle del Olivo, 12 · Madrid',
  telefono: '910 123 456',
  servicio: 'Servicio de cena · 19:00–23:00',
  maxPersonas: 8,
}

/** 12 mesas · 40 plazas totales */
export const MESAS = [
  { id: 'M01', capacidad: 2 }, { id: 'M02', capacidad: 2 }, { id: 'M03', capacidad: 2 },
  { id: 'M04', capacidad: 4 }, { id: 'M05', capacidad: 4 }, { id: 'M06', capacidad: 4 },
  { id: 'M07', capacidad: 4 }, { id: 'M08', capacidad: 4 }, { id: 'M09', capacidad: 4 },
  { id: 'M10', capacidad: 4 }, { id: 'M11', capacidad: 4 }, { id: 'M12', capacidad: 2 },
]

/** Franjas horarias del servicio. El cliente solo ve las cuatro primeras. */
export const HORAS_SERVICIO = ['19:30', '20:00', '20:30', '21:00', '21:30']
export const HORAS_CLIENTE = HORAS_SERVICIO.slice(0, 4)

export const ESTADOS = {
  confirmada: 'Confirmada',
  'en-atencion': 'En atención',
  cancelada: 'Cancelada',
}

export const RESERVAS_INICIALES = [
  { codigo: 'SM-3040', fecha: FECHA_DEMO, hora: '19:30', cliente: 'Carlos Ruiz', personas: 2, mesa: 'M02', estado: 'en-atencion', telefono: '+34 600 111 222', correo: 'carlos.ruiz@ejemplo.com', notas: '', origen: 'telefono' },
  { codigo: 'SM-3042', fecha: FECHA_DEMO, hora: '20:30', cliente: 'Lucía Martínez', personas: 4, mesa: 'M04', estado: 'confirmada', telefono: '+34 612 345 678', correo: 'lucia.martinez@ejemplo.com', notas: '', origen: 'telefono' },
  { codigo: 'SM-3043', fecha: FECHA_DEMO, hora: '21:00', cliente: 'Ana López', personas: 3, mesa: 'M06', estado: 'confirmada', telefono: '+34 600 333 444', correo: 'ana.lopez@ejemplo.com', notas: '', origen: 'presencial' },
  { codigo: 'SM-3038', fecha: FECHA_DEMO, hora: '21:30', cliente: 'Pedro Gil', personas: 2, mesa: 'M03', estado: 'cancelada', telefono: '+34 600 555 666', correo: 'pedro.gil@ejemplo.com', notas: '', origen: 'telefono' },
]

/** Mesas bloqueadas por otras reservas del turno que no se listan en el panel */
export const BLOQUEOS_INICIALES = [
  { fecha: FECHA_DEMO, hora: '20:00', mesa: 'M04', motivo: 'Ocupada / sin cupo' },
]

/**
 * Parte del día que no se detalla en la lista (resto de reservas del servicio).
 * Sumado a las reservas en vivo reproduce los indicadores del diseño: 25 reservas, 8/12 mesas, 28 personas.
 */
export const BASE_DIA = { activas: 21, canceladas: 0, mesasOcupadas: 5, personas: 19 }

/** Cupo online disponible por franja el día de demo; el resto de días tienen 4 por franja. */
export const CUPO_ONLINE_BASE = { '19:30': 3, '20:00': 0, '20:30': 2, '21:00': 2, '21:30': 2 }
export const CUPO_ONLINE_DEFECTO = 4
