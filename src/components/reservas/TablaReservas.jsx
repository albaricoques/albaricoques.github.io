import Icono from '../ui/Icono.jsx'
import EtiquetaEstado from '../ui/EtiquetaEstado.jsx'

const hrefEditar = (r) => `#/admin/editar/${r.codigo}`

/** Lista de reservas: tabla en escritorio y tarjetas en móvil */
export default function TablaReservas({ reservas, destacada }) {
  if (reservas.length === 0) {
    return <div className="tabla-reservas"><p className="tabla-vacia">No hay reservas con estos filtros.</p></div>
  }
  return (
    <>
      <div className="tabla-reservas">
        <table>
          <thead>
            <tr>
              <th scope="col">Hora</th><th scope="col">Cliente / código</th><th scope="col">Pers.</th>
              <th scope="col">Mesa</th><th scope="col">Estado</th><th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.codigo} className={`${r.codigo === destacada ? 'fila--resaltada' : ''} ${r.estado === 'cancelada' ? 'fila--cancelada' : ''}`.trim()}>
                <td className="tabla__hora">{r.hora}</td>
                <td><span className="tabla__cliente">{r.cliente}</span><span className="tabla__codigo">{r.codigo}</span></td>
                <td>{r.personas}</td>
                <td>{r.mesa}</td>
                <td className="celda-estado"><EtiquetaEstado estado={r.estado} /></td>
                <td className="celda-accion">
                  <a className="accion" href={hrefEditar(r)}>Ver / Editar <Icono nombre="externo" tamano={11} grosor={2} /></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="tarjetas-reservas">
        {reservas.map((r) => (
          <li key={r.codigo} className="tarjeta-reserva">
            <div className="tarjeta-reserva__cabecera">
              <span className="tarjeta-reserva__hora">{r.hora}</span>
              <EtiquetaEstado estado={r.estado} />
            </div>
            <div>
              <p className="tarjeta-reserva__cliente">{r.cliente}</p>
              <p className="tarjeta-reserva__codigo">{r.codigo}</p>
            </div>
            <p className="tarjeta-reserva__datos">{r.personas} personas · Mesa {r.mesa}</p>
            <a className="btn btn--enlace tarjeta-reserva__accion" href={hrefEditar(r)}>Ver / Editar reserva →</a>
          </li>
        ))}
      </ul>
    </>
  )
}
