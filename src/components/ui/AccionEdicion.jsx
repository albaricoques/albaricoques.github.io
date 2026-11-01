import Icono from './Icono.jsx'

/** Fila "Fecha y hora · Editar" del resumen */
export default function AccionEdicion({ etiqueta, onEditar }) {
  return (
    <div className="accion-edicion">
      <span>{etiqueta}</span>
      <button type="button" className="btn btn--enlace" onClick={onEditar}>
        Editar <Icono nombre="externo" tamano={12} grosor={2} />
      </button>
    </div>
  )
}
