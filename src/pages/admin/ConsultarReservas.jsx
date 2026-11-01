import { useMemo, useState } from 'react'
import LayoutAdmin from '../../components/layout/LayoutAdmin.jsx'
import Campo from '../../components/ui/Campo.jsx'
import Chip from '../../components/ui/Chip.jsx'
import Boton from '../../components/ui/Boton.jsx'
import Calendario from '../../components/reservas/Calendario.jsx'
import Agenda from '../../components/reservas/Agenda.jsx'
import TablaReservas from '../../components/reservas/TablaReservas.jsx'
import { useReservas } from '../../hooks/useReservas.jsx'
import { ESTADOS, FECHA_DEMO } from '../../data/seed.js'
import { construirAgenda, proximaLlegada } from '../../utils/agenda.js'
import { aFecha, diaMes, diasDeSemana, diasDelMes, fechaMedia } from '../../utils/fechas.js'

const OPCIONES_FECHA = diasDelMes(2026, 9).map((d) => ({ valor: d, texto: fechaMedia(d) }))

export default function ConsultarReservas() {
  const { reservas, bloqueos } = useReservas()
  const [fecha, setFecha] = useState(FECHA_DEMO)
  const [vista, setVista] = useState('dia')
  const [filtros, setFiltros] = useState([])

  const dias = useMemo(() => (vista === 'dia' ? [fecha] : diasDeSemana(fecha)), [vista, fecha])
  const diasConReservas = useMemo(() => new Set(reservas.map((r) => r.fecha)), [reservas])

  const resultados = useMemo(
    () =>
      reservas
        .filter((r) => dias.includes(r.fecha))
        .filter((r) => filtros.length === 0 || filtros.includes(r.estado))
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)),
    [reservas, dias, filtros],
  )

  const alternar = (estado) => setFiltros((f) => (f.includes(estado) ? f.filter((e) => e !== estado) : [...f, estado]))
  const diasConAgenda = dias.filter((d) => construirAgenda({ reservas, bloqueos, fecha: d }).length > 0)

  return (
    <LayoutAdmin
      activo="reservas"
      fecha={fecha}
      titulo="Calendario y reservas"
      descripcion="Consulta la agenda por horario o abre una reserva para ver, editar o cancelar."
    >
      <div className="consulta__controles">
        <Campo
          tipo="select"
          etiqueta="Día de consulta"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          opciones={OPCIONES_FECHA}
        />
        <div className="consulta__acciones">
          <Chip activo={vista === 'dia'} bloque onClick={() => setVista('dia')}>Día</Chip>
          <Chip activo={vista === 'semana'} bloque onClick={() => setVista('semana')}>Semana</Chip>
          <Boton href="#/admin/nueva" variante="primario">+ Nueva reserva</Boton>
        </div>
      </div>

      <div className="consulta__cuerpo">
        <Calendario fecha={fecha} onSeleccionar={setFecha} diasConReservas={diasConReservas} />
        <div className="seccion">
          {diasConAgenda.length === 0 ? (
            <Agenda fecha={fecha} reservas={reservas} bloqueos={bloqueos} titulo={vista === 'dia' ? `Agenda · ${diaMes(fecha)}` : 'Agenda de la semana'} />
          ) : (
            diasConAgenda.map((d) => (
              <Agenda key={d} fecha={d} reservas={reservas} bloqueos={bloqueos} />
            ))
          )}
        </div>
      </div>

      <section className="seccion" aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados" className="seccion__titulo">
          Reservas · {resultados.length} resultado{resultados.length === 1 ? '' : 's'} del turno
        </h2>
        <div className="filtros" role="group" aria-label="Filtrar por estado">
          {Object.entries(ESTADOS).map(([clave, texto]) => (
            <Chip key={clave} activo={filtros.includes(clave)} onClick={() => alternar(clave)}>{texto}</Chip>
          ))}
        </div>
        <p className="filtros-nota" aria-live="polite">
          {filtros.length === 0
            ? 'Sin filtros aplicados · Se muestran todos los estados.'
            : `Filtrando por: ${filtros.map((f) => ESTADOS[f]).join(', ')}.`}
        </p>
        <TablaReservas reservas={resultados} destacada={proximaLlegada(resultados, fecha)?.codigo} />
      </section>

      <a className="enlace-volver" href="#/admin">← Volver al panel principal</a>
    </LayoutAdmin>
  )
}
