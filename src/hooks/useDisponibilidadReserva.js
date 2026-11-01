import { useMemo } from 'react'
import { useReservas } from './useReservas.jsx'
import { buscarAlternativa, capacidadMesa, mesaOcupada, validarCorreo, validarTelefono, hayTexto } from '../utils/disponibilidad.js'

/**
 * Valida en tiempo real una combinación fecha + hora + personas + mesa contra la agenda.
 * `ignorar` es el código de la reserva que se edita, para no contarla dos veces.
 */
export default function useDisponibilidadReserva({ fecha, hora, mesa, personas, nombre, telefono, correo }, ignorar) {
  const { reservas, bloqueos } = useReservas()

  return useMemo(() => {
    const ocupada = mesaOcupada({ reservas, bloqueos, fecha, hora, mesa, ignorar })
    const capacidadInsuficiente = capacidadMesa(mesa) < personas
    const conflicto = ocupada || capacidadInsuficiente
    const alternativa = conflicto ? buscarAlternativa({ reservas, bloqueos, fecha, hora, mesa, personas, ignorar }) : null
    const errores = {
      nombre: hayTexto(nombre) ? null : 'Escribe el nombre completo.',
      telefono: validarTelefono(telefono) ? null : 'Usa prefijo y 9 cifras, como +34 612 345 678.',
      correo: validarCorreo(correo) ? null : 'Introduce un correo válido, como nombre@dominio.com.',
    }
    const datosValidos = !errores.nombre && !errores.telefono && !errores.correo
    return { ocupada, capacidadInsuficiente, conflicto, alternativa, errores, datosValidos, puedeGuardar: !conflicto && datosValidos && personas >= 1 }
  }, [reservas, bloqueos, fecha, hora, mesa, personas, nombre, telefono, correo, ignorar])
}
