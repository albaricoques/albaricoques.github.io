import { useState } from 'react'
import LayoutAdmin from '../../components/layout/LayoutAdmin.jsx'
import Campo from '../../components/ui/Campo.jsx'
import Boton from '../../components/ui/Boton.jsx'
import Aviso from '../../components/ui/Aviso.jsx'
import Icono from '../../components/ui/Icono.jsx'
import EtiquetaEstado from '../../components/ui/EtiquetaEstado.jsx'
import Calendario from '../../components/reservas/Calendario.jsx'
import Agenda from '../../components/reservas/Agenda.jsx'
import { useReservas } from '../../hooks/useReservas.jsx'
import useDisponibilidadReserva from '../../hooks/useDisponibilidadReserva.js'
import { HORAS_SERVICIO, MESAS, RESTAURANTE } from '../../data/seed.js'
import { diasDelMes, fechaMedia, fechaLarga, fechaSimple } from '../../utils/fechas.js'

const OPCIONES_FECHA = diasDelMes(2026, 9).map((d) => ({ valor: d, texto: fechaMedia(d) }))
const OPCIONES_HORA = HORAS_SERVICIO.map((h) => ({ valor: h, texto: `${h} h` }))
const OPCIONES_MESA = MESAS.map((m) => ({ valor: m.id, texto: `${m.id} · ${m.capacidad} plazas` }))

export default function EditarCancelar({ codigo }) {
  const { reservas } = useReservas()
  const reserva = codigo
    ? reservas.find((r) => r.codigo === codigo)
    : reservas.find((r) => r.estado !== 'cancelada' && r.fecha === '2026-10-30' && r.codigo === 'SM-3042') ?? reservas.find((r) => r.estado !== 'cancelada')

  if (!reserva) {
    return (
      <LayoutAdmin activo="editar" titulo="Modificar o cancelar" descripcion="No se encontró la reserva solicitada.">
        <Aviso tipo="error" titulo="Reserva no encontrada">Revisa el código o vuelve al calendario para elegir otra reserva.</Aviso>
        <a className="enlace-volver" href="#/admin/reservas">← Ir al calendario y reservas</a>
      </LayoutAdmin>
    )
  }
  // key: al cambiar de reserva el formulario se reinicia con sus datos
  return <Editor key={reserva.codigo} reservaInicial={reserva} />
}

function Editor({ reservaInicial }) {
  const { reservas, bloqueos, actualizarReserva, cancelarReserva } = useReservas()
  const actual = reservas.find((r) => r.codigo === reservaInicial.codigo) ?? reservaInicial
  const [form, setForm] = useState({
    fecha: actual.fecha, hora: actual.hora, personas: actual.personas, mesa: actual.mesa,
    nombre: actual.cliente, telefono: actual.telefono, correo: actual.correo, notas: actual.notas ?? '',
  })
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState(null) // null | 'guardado' | 'cancelada' | 'ya-cancelada'

  const cancelada = actual.estado === 'cancelada'
  const v = useDisponibilidadReserva(form, actual.codigo)
  const poner = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const cambiarPersonas = (e) => {
    const n = Math.min(RESTAURANTE.maxPersonas, Math.max(1, Number(e.target.value) || 1))
    setForm((f) => ({ ...f, personas: n }))
  }

  const guardar = () => {
    if (!v.puedeGuardar || cancelada) return
    const { nombre, ...resto } = form
    actualizarReserva(actual.codigo, { ...resto, cliente: nombre.trim() })
    setResultado('guardado')
  }

  const confirmarCancelacion = () => {
    // Se comprueba que la reserva siga activa para no cancelarla dos veces
    if (actual.estado === 'cancelada') { setResultado('ya-cancelada'); setConfirmando(false); return }
    cancelarReserva(actual.codigo)
    setConfirmando(false)
    setResultado('cancelada')
  }

  return (
    <LayoutAdmin
      activo="editar"
      fecha={form.fecha}
      titulo="Modificar o cancelar"
      descripcion={`Reserva ${actual.codigo} · ${actual.cliente}. Consulta la agenda mientras editas los datos de la reserva.`}
    >
      <div className="editar">
        <aside className="editar__lateral" aria-label="Agenda y calendario">
          <Agenda sombra fecha={form.fecha} reservas={reservas} bloqueos={bloqueos} />
          <Calendario fecha={form.fecha} onSeleccionar={(d) => setForm((f) => ({ ...f, fecha: d }))} diasConReservas={new Set(reservas.map((r) => r.fecha))} />
          <p className="editar__nota">{fechaSimple(form.fecha)} · Vista Día</p>
        </aside>

        <section className="edicion" aria-labelledby="titulo-edicion">
          <div className="edicion__cabecera">
            <h2 id="titulo-edicion">Editar reserva</h2>
            <a className="edicion__cerrar" href="#/admin/reservas" aria-label="Cerrar y volver a las reservas"><Icono nombre="cerrar" tamano={22} /></a>
          </div>
          <div className="edicion__codigo">{actual.codigo} <EtiquetaEstado estado={actual.estado} /></div>

          {cancelada && <Aviso tipo="neutro" titulo="Reserva cancelada">Esta reserva ya no ocupa mesa. No se puede modificar ni cancelar de nuevo.</Aviso>}

          <div className="formulario">
            <div className="formulario__fila">
              <Campo tipo="select" etiqueta="Fecha" requerido value={form.fecha} onChange={poner('fecha')} opciones={OPCIONES_FECHA} disabled={cancelada} />
              <Campo tipo="select" etiqueta="Hora" requerido value={form.hora} onChange={poner('hora')} opciones={OPCIONES_HORA} disabled={cancelada} />
            </div>
            <div className="formulario__fila">
              <Campo tipo="number" etiqueta="Personas" requerido min={1} max={RESTAURANTE.maxPersonas} value={form.personas} onChange={cambiarPersonas} disabled={cancelada} />
              <Campo tipo="select" etiqueta="Mesa" requerido value={form.mesa} onChange={poner('mesa')} opciones={OPCIONES_MESA} disabled={cancelada} />
            </div>
            <Campo etiqueta="Nombre completo" requerido value={form.nombre} onChange={poner('nombre')} error={v.errores.nombre} disabled={cancelada} />
            <div className="formulario__fila">
              <Campo etiqueta="Teléfono" requerido type="tel" value={form.telefono} onChange={poner('telefono')} error={v.errores.telefono} disabled={cancelada} />
              <Campo etiqueta="Correo electrónico" requerido tipo="email" value={form.correo} onChange={poner('correo')} error={v.errores.correo} disabled={cancelada} />
            </div>
            <Campo etiqueta="Notas especiales (opcional)" value={form.notas} onChange={poner('notas')} disabled={cancelada} placeholder="Sin solicitudes especiales" />

            {!cancelada && (v.conflicto ? (
              <Aviso tipo="error" titulo="Conflicto de disponibilidad">
                {v.ocupada
                  ? `${form.mesa} ya está asignada a las ${form.hora}. Guardar está bloqueado para evitar una doble reserva.`
                  : `${form.mesa} no tiene capacidad para ${form.personas} personas.`}
                {v.alternativa ? ` Alternativa: ${v.alternativa.hora} · ${v.alternativa.mesa}.` : ''}
              </Aviso>
            ) : (
              <Aviso tipo="exito" titulo="Disponible · Sin conflictos">
                {fechaMedia(form.fecha).split(' ').slice(1, 3).join(' ')} · {form.hora} · {form.personas} personas · {form.mesa}. Validada sin contar dos veces esta reserva. Guardar se bloquea si hay conflicto.
              </Aviso>
            ))}

            <Boton variante="primario" bloque disabled={!v.puedeGuardar || cancelada} onClick={guardar}>Guardar cambios</Boton>
          </div>

          {!cancelada && (
            <div className="cancelacion">
              <h3>Cancelar reserva</h3>
              {!confirmando ? (
                <Boton bloque onClick={() => setConfirmando(true)}>Cancelar reserva</Boton>
              ) : (
                <>
                  <p className="cancelacion__pregunta">¿Cancelar {actual.codigo}?</p>
                  <p>Se liberarán {actual.personas} plazas de {actual.mesa} a las {actual.hora}. El cupo no se libera hasta confirmar.</p>
                  <p className="cancelacion__pie">Se comprueba que la reserva siga activa para evitar una doble cancelación.</p>
                  <Boton variante="peligro" bloque onClick={confirmarCancelacion}>Sí, cancelar reserva</Boton>
                  <Boton bloque onClick={() => setConfirmando(false)}>No, mantener reserva</Boton>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {resultado && (
        <section className="estado-posterior" aria-live="polite">
          <h2>{resultado === 'guardado' ? 'Tras guardar' : 'Tras confirmar cancelación'}</h2>
          {resultado === 'guardado' && (
            <Aviso tipo="exito" titulo="Cambios guardados">Agenda actualizada. El cupo permanece reservado.</Aviso>
          )}
          {resultado === 'cancelada' && (
            <Aviso tipo="neutro" titulo="Reserva cancelada">Agenda actualizada. El cupo no se libera dos veces.</Aviso>
          )}
          {resultado === 'ya-cancelada' && (
            <Aviso tipo="neutro" titulo="Ya estaba cancelada">No se realizó ningún cambio: el cupo no se libera dos veces.</Aviso>
          )}
          <p className="estado-posterior__dato">{fechaLarga(actual.fecha).replace(/^./, (c) => c.toUpperCase())}</p>
          <p className="estado-posterior__linea">
            {actual.hora} · {actual.mesa} · {resultado === 'guardado' ? `${actual.cliente.split(' ')[0]} · ${actual.personas} personas` : `Libre · ${actual.personas} plazas`}
          </p>
          <div><EtiquetaEstado estado={actual.estado}>{actual.codigo} · {actual.estado === 'cancelada' ? 'Cancelada' : 'Confirmada'}</EtiquetaEstado></div>
          <a className="enlace-volver" href="#/admin/reservas">← Volver a las reservas</a>
        </section>
      )}
    </LayoutAdmin>
  )
}
