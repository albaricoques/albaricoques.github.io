import { useMemo, useState } from 'react'
import LayoutAdmin from '../../components/layout/LayoutAdmin.jsx'
import Indicador from '../../components/ui/Indicador.jsx'
import Boton from '../../components/ui/Boton.jsx'
import Aviso from '../../components/ui/Aviso.jsx'
import Calendario from '../../components/reservas/Calendario.jsx'
import Agenda from '../../components/reservas/Agenda.jsx'
import TablaReservas from '../../components/reservas/TablaReservas.jsx'
import { useReservas } from '../../hooks/useReservas.jsx'
import { FECHA_DEMO } from '../../data/seed.js'
import { estadisticasDia } from '../../utils/disponibilidad.js'
import { contarSobrecupos, mesasLibresProximoTurno, proximaLlegada } from '../../utils/agenda.js'

export default function PanelPrincipal() {
  const { reservas, bloqueos } = useReservas()
  const [fecha, setFecha] = useState(FECHA_DEMO)

  const stats = useMemo(() => estadisticasDia(reservas, fecha), [reservas, fecha])
  const delDia = useMemo(() => reservas.filter((r) => r.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora)), [reservas, fecha])
  const proxima = proximaLlegada(reservas, fecha)
  const sobrecupos = contarSobrecupos(reservas)
  const diasConReservas = useMemo(() => new Set(reservas.map((r) => r.fecha)), [reservas])

  return (
    <LayoutAdmin
      activo="panel"
      fecha={fecha}
      titulo="Panel principal"
      descripcion="Centro de control de reservas y capacidad del servicio de cena."
    >
      <div className="panel__indicadores">
        <Indicador etiqueta="Reservas del día" valor={stats.total} nota={`${stats.activas} activas · ${stats.canceladas} cancelada${stats.canceladas === 1 ? '' : 's'}`} />
        <Indicador etiqueta="Mesas ocupadas" valor={`${stats.mesasOcupadas}/${stats.mesas}`} nota={`${stats.personas} personas en sala`} />
        <Indicador etiqueta="Capacidad restante" valor={stats.capacidadRestante} nota={`De ${stats.plazas} plazas totales`} />
      </div>

      <section className="panel__acciones" aria-labelledby="que-hacer">
        <h2 id="que-hacer">¿Qué necesitas hacer?</h2>
        <div className="panel__botones">
          <Boton href="#/admin/reservas">Consultar reservas</Boton>
          <Boton href="#/admin/nueva" variante="primario">Nueva reserva</Boton>
          <Boton href="#/admin/editar">Editar</Boton>
          <Boton href="#/admin/editar">Cancelar</Boton>
        </div>
      </section>

      {sobrecupos > 0 ? (
        <Aviso tipo="error" titulo={`Resumen operativo · ${sobrecupos} sobrecupo${sobrecupos === 1 ? '' : 's'}`}>
          Hay mesas asignadas dos veces a la misma hora. Revisa la agenda.
        </Aviso>
      ) : (
        <Aviso tipo="exito" titulo="Resumen operativo · Sin sobrecupos">
          {proxima
            ? `Próxima llegada: ${proxima.cliente} · ${proxima.hora} · ${proxima.personas} personas · ${proxima.mesa}. Quedan ${mesasLibresProximoTurno(reservas, fecha, proxima.hora)} mesas libres para el próximo turno.`
            : 'No hay llegadas pendientes en este turno.'}
        </Aviso>
      )}

      <div className="panel__cuerpo">
        <div className="panel__lateral">
          <Calendario fecha={fecha} onSeleccionar={setFecha} diasConReservas={diasConReservas} />
          <Agenda sombra fecha={fecha} reservas={reservas} bloqueos={bloqueos} />
        </div>
        <section className="seccion" aria-labelledby="reservas-turno">
          <h2 id="reservas-turno" className="seccion__titulo">Reservas del turno</h2>
          <TablaReservas reservas={delDia} destacada={proxima?.codigo} />
          <a className="enlace-volver" href="#/admin/reservas">Ver todas las reservas →</a>
        </section>
      </div>
    </LayoutAdmin>
  )
}
