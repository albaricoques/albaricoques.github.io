import Icono from '../ui/Icono.jsx'
import Tarjeta from '../ui/Tarjeta.jsx'
import { RESTAURANTE } from '../../data/seed.js'
import { fechaLarga } from '../../utils/fechas.js'

/** Tarjeta "Tu reserva": crece con cada paso (fecha, hora, comensales, datos de contacto) */
export default function ResumenReserva({ fecha, hora, personas, nombre, telefono, correo, notas, completo = false, children }) {
  const filas = [
    ['Fecha', fecha && fechaLarga(fecha).replace(/^./, (c) => c.toUpperCase())],
    ['Hora', hora && `${hora} h`],
    ['Comensales', personas && `${personas} persona${personas === 1 ? '' : 's'}`],
    completo && ['Nombre', nombre],
    completo && ['Teléfono', telefono],
    completo && ['Correo', correo],
    completo && ['Notas', notas || 'Sin solicitudes especiales'],
  ].filter((f) => f && f[1])

  return (
    <Tarjeta sombra className="resumen">
      <h2 className="resumen__titulo">Tu reserva</h2>
      <p className="resumen__restaurante"><Icono nombre="cubiertos" tamano={22} grosor={1.5} />{RESTAURANTE.nombre}</p>
      <dl>
        {filas.map(([k, v]) => (
          <div key={k} className="resumen__dato"><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      {children}
    </Tarjeta>
  )
}
