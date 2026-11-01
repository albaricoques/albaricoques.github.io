import { describe, it, expect } from 'vitest'
import { RESERVAS_INICIALES, BLOQUEOS_INICIALES, FECHA_DEMO } from '../data/seed.js'
import {
  mesaOcupada, buscarAlternativa, estadisticasDia, siguienteCodigo,
  validarTelefono, validarCorreo, cupoOnline, asignarMesa,
} from './disponibilidad.js'
import { matrizMes, fechaLarga } from './fechas.js'

const ctx = { reservas: RESERVAS_INICIALES, bloqueos: BLOQUEOS_INICIALES, fecha: FECHA_DEMO }

describe('conflictos de mesa', () => {
  it('detecta M04 ocupada a las 20:00 (bloqueo)', () => {
    expect(mesaOcupada({ ...ctx, hora: '20:00', mesa: 'M04' })).toBe(true)
  })
  it('detecta M04 ocupada a las 20:30 por la reserva SM-3042', () => {
    expect(mesaOcupada({ ...ctx, hora: '20:30', mesa: 'M04' })).toBe(true)
  })
  it('no cuenta dos veces la reserva que se está editando', () => {
    expect(mesaOcupada({ ...ctx, hora: '20:30', mesa: 'M04', ignorar: 'SM-3042' })).toBe(false)
  })
  it('una reserva cancelada libera la mesa', () => {
    expect(mesaOcupada({ ...ctx, hora: '21:30', mesa: 'M03' })).toBe(false)
  })
})

describe('alternativas', () => {
  it('propone la franja más cercana con cupo para el mismo grupo', () => {
    const alt = buscarAlternativa({ ...ctx, hora: '20:00', mesa: 'M04', personas: 4 })
    expect(alt).toEqual({ hora: '20:30', mesa: 'M05', plazas: 4 })
  })
})

describe('indicadores del día', () => {
  it('reproducen el panel del diseño', () => {
    const s = estadisticasDia(RESERVAS_INICIALES, FECHA_DEMO)
    expect(s.total).toBe(25)
    expect(s.activas).toBe(24)
    expect(s.canceladas).toBe(1)
    expect(s.mesasOcupadas).toBe(8)
    expect(s.personas).toBe(28)
    expect(s.capacidadRestante).toBe(12)
    expect(s.plazas).toBe(40)
  })
})

describe('cupo online y asignación', () => {
  it('20:00 está agotado el día de demo', () => {
    expect(cupoOnline({ reservas: RESERVAS_INICIALES, fecha: FECHA_DEMO, hora: '20:00' })).toBe(0)
  })
  it('asigna la mesa más ajustada y libre', () => {
    expect(asignarMesa({ ...ctx, hora: '20:30', personas: 4 })).toBe('M05')
    expect(asignarMesa({ ...ctx, hora: '19:30', personas: 2 })).toBe('M01')
  })
  it('genera el siguiente código', () => {
    expect(siguienteCodigo(RESERVAS_INICIALES)).toBe('SM-3044')
  })
})

describe('validaciones', () => {
  it('teléfono con prefijo y 9 cifras', () => {
    expect(validarTelefono('+34 612 345 678')).toBe(true)
    expect(validarTelefono('612345678')).toBe(false)
  })
  it('correo', () => {
    expect(validarCorreo('lucia.martinez@ejemplo.com')).toBe(true)
    expect(validarCorreo('lucia@')).toBe(false)
  })
})

describe('fechas', () => {
  it('octubre de 2026 empieza en jueves', () => {
    expect(matrizMes(2026, 9)[0].indexOf(1)).toBe(3)
  })
  it('formatea la fecha larga', () => {
    expect(fechaLarga('2026-10-30')).toBe('viernes 30 de octubre de 2026')
  })
})
