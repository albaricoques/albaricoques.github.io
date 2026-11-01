import { useState } from 'react'
import LayoutAdmin from '../../components/layout/LayoutAdmin.jsx'
import Campo from '../../components/ui/Campo.jsx'
import Chip from '../../components/ui/Chip.jsx'
import Boton from '../../components/ui/Boton.jsx'
import Aviso from '../../components/ui/Aviso.jsx'
import Icono from '../../components/ui/Icono.jsx'
import Tarjeta from '../../components/ui/Tarjeta.jsx'
import Calendario from '../../components/reservas/Calendario.jsx'
import Agenda from '../../components/reservas/Agenda.jsx'
import { useReservas } from '../../hooks/useReservas.jsx'
import useDisponibilidadReserva from '../../hooks/useDisponibilidadReserva.js'
import { FECHA_DEMO, HORAS_SERVICIO, MESAS, RESTAURANTE } from '../../data/seed.js'
import { diasDelMes, fechaLarga } from '../../utils/fechas.js'

const OPCIONES_FECHA = diasDelMes(2026, 9).map((d) => ({ valor: d, texto: fechaLarga(d).replace(/^./, (c) => c.toUpperCase()) }))
const OPCIONES_HORA = HORAS_SERVICIO.map((h) => ({ valor: h, texto: `${h} h` }))
const OPCIONES_MESA = MESAS.map((m) => ({ valor: m.id, texto: `${m.id} · Capacidad ${m.capacidad}` }))

const INICIAL = {
  canal: 'telefono', fecha: FECHA_DEMO, hora: '20:00', personas: 4, mesa: 'M04',
  nombre: '', telefono: '+34 ', correo: '', notas: '',
}

export default function NuevaReserva() {
  const { reservas, bloqueos, crearReserva } = useReservas()
  const [form, setForm] = useState(INICIAL)
  const [tocados, setTocados] = useState({})
  const [creada, setCreada] = useState(null)

  const v = useDisponibilidadReserva(form)
  const poner = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const errorDe = (campo) => (tocados[campo] ? v.errores[campo] : null)

  const aplicarAlternativa = () => setForm((f) => ({ ...f, hora: v.alternativa.hora, mesa: v.alternativa.mesa }))
  const cambiarPersonas = (e) => {
    const n = Math.min(RESTAURANTE.maxPersonas, Math.max(1, Number(e.target.value) || 1))
    setForm((f) => ({ ...f, personas: n }))
  }

  const guardar = (e) => {
    e.preventDefault()
    if (!v.puedeGuardar) return
    const { canal, ...resto } = form
    setCreada(crearReserva({ ...resto, cliente: form.nombre.trim(), origen: canal }))
  }

  const nueva = () => { setForm(INICIAL); setTocados({}); setCreada(null) }

  const mensajeConflicto = v.ocupada
    ? `${form.mesa} ya está asignada a las ${form.hora}. Guardar está bloqueado para evitar una doble reserva.`
    : `${form.mesa} tiene capacidad para ${MESAS.find((m) => m.id === form.mesa).capacidad} personas y la reserva es para ${form.personas}.`

  return (
    <LayoutAdmin
      activo="nueva"
      fecha={form.fecha}
      titulo="Nueva reserva manual"
      descripcion="Alta por teléfono o presencial. Comprueba la disponibilidad antes de crear la reserva."
    >
      <div className="alta">
        <Tarjeta>
          {creada ? (
            <div className="formulario">
              <Aviso tipo="exito" titulo={`Reserva ${creada.codigo} creada`}>
                {creada.cliente} · {creada.hora} · {creada.personas} personas · {creada.mesa}. La agenda se ha actualizado.
              </Aviso>
              <div className="formulario__acciones">
                <Boton variante="primario" bloque href="#/admin/reservas">Ver en el calendario</Boton>
                <Boton bloque onClick={nueva}>Crear otra reserva</Boton>
              </div>
            </div>
          ) : (
            <form className="formulario" onSubmit={guardar} noValidate>
              <p className="formulario__obligatorios">* Campos obligatorios</p>

              <div className="formulario__modos" role="group" aria-label="Canal de la reserva">
                <Chip activo={form.canal === 'telefono'} bloque onClick={() => setForm((f) => ({ ...f, canal: 'telefono' }))}>
                  {form.canal === 'telefono' && <Icono nombre="check" tamano={14} grosor={2} />}Teléfono
                </Chip>
                <Chip activo={form.canal === 'presencial'} bloque onClick={() => setForm((f) => ({ ...f, canal: 'presencial' }))}>
                  {form.canal === 'presencial' && <Icono nombre="check" tamano={14} grosor={2} />}Presencial
                </Chip>
              </div>

              <Campo tipo="select" etiqueta="Fecha" requerido value={form.fecha} onChange={poner('fecha')} opciones={OPCIONES_FECHA} />

              <div className="formulario__fila">
                <Campo tipo="select" etiqueta="Hora" requerido value={form.hora} onChange={poner('hora')} opciones={OPCIONES_HORA} />
                <Campo tipo="number" etiqueta="Personas" requerido min={1} max={RESTAURANTE.maxPersonas} value={form.personas} onChange={cambiarPersonas} />
              </div>

              <Campo
                tipo="select" etiqueta="Mesa" requerido value={form.mesa} onChange={poner('mesa')} opciones={OPCIONES_MESA}
                error={v.conflicto ? (v.ocupada ? `Ocupada a las ${form.hora}. Sin cupo para esta combinación.` : 'Capacidad insuficiente para este grupo.') : null}
              />

              {v.conflicto && (
                <Aviso tipo="error" titulo="Conflicto de disponibilidad">{mensajeConflicto}</Aviso>
              )}

              {v.conflicto && v.alternativa && (
                <div className="formulario__alternativa">
                  <span>{v.alternativa.hora} · {v.alternativa.mesa} · {v.alternativa.plazas} plazas libres</span>
                  <Boton bloque onClick={aplicarAlternativa}>Usar alternativa de las {v.alternativa.hora}</Boton>
                  <small>Pendiente de aplicar. Se volverá a validar antes de habilitar Guardar.</small>
                </div>
              )}

              {!v.conflicto && (
                <Aviso tipo="exito" titulo="Disponible · Sin conflictos">
                  {form.hora} · {form.mesa} · {form.personas} personas. Validada contra la agenda del día.
                </Aviso>
              )}

              <Campo etiqueta="Nombre completo" requerido placeholder="Lucía Martínez" value={form.nombre} onChange={poner('nombre')} onBlur={tocar('nombre')} error={errorDe('nombre')} autoComplete="off" />
              <Campo etiqueta="Teléfono" requerido type="tel" inputMode="tel" placeholder="+34 612 345 678" value={form.telefono} onChange={poner('telefono')} onBlur={tocar('telefono')} error={errorDe('telefono')} ok={!v.errores.telefono ? 'Correcto · prefijo y 9 cifras' : null} />
              <Campo etiqueta="Correo electrónico" requerido tipo="email" placeholder="lucia.martinez@ejemplo.com" value={form.correo} onChange={poner('correo')} onBlur={tocar('correo')} error={errorDe('correo')} />
              <Campo etiqueta="Notas especiales (opcional)" placeholder="Sin solicitudes especiales" value={form.notas} onChange={poner('notas')} />

              <div className="formulario__acciones">
                <Boton tipo="submit" variante="primario" bloque disabled={!v.puedeGuardar}>
                  {v.conflicto ? 'Guardar reserva · Bloqueado' : 'Guardar reserva'}
                </Boton>
                <Boton bloque href="#/admin">Volver al panel</Boton>
              </div>
            </form>
          )}
        </Tarjeta>

        <aside className="alta__lateral" aria-label="Calendario y agenda">
          <Calendario fecha={form.fecha} onSeleccionar={(d) => setForm((f) => ({ ...f, fecha: d }))} diasConReservas={new Set(reservas.map((r) => r.fecha))} />
          <Agenda sombra titulo="Agenda antes del alta" fecha={form.fecha} reservas={reservas} bloqueos={bloqueos} />
          <div className="alta__validacion">
            <Icono nombre="info" tamano={20} />
            <p>
              <strong>Validación antes de guardar</strong>
              Fecha + hora + personas + mesa. Resuelve el conflicto para crear la reserva.
            </p>
          </div>
        </aside>
      </div>
    </LayoutAdmin>
  )
}
