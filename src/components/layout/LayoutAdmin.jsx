import { useEffect } from 'react'
import EncabezadoAdministracion from './EncabezadoAdministracion.jsx'
import NavegacionLateral from './NavegacionLateral.jsx'
import NavegacionCompacta from './NavegacionCompacta.jsx'
import { FECHA_DEMO } from '../../data/seed.js'
import { fechaMayus } from '../../utils/fechas.js'

export default function LayoutAdmin({ activo, titulo, descripcion, fecha = FECHA_DEMO, children }) {
  useEffect(() => {
    document.title = `${titulo} · La Sobremesa Admin`
  }, [titulo])

  return (
    <div className="admin">
      <EncabezadoAdministracion />
      <NavegacionCompacta activo={activo} />
      <div className="admin__cuerpo">
        <NavegacionLateral activo={activo} />
        <main className="admin__principal">
          <div className="admin__cabecera">
            <p className="eyebrow">{fechaMayus(fecha)} · Turno de cena</p>
            <h1>{titulo}</h1>
            <p>{descripcion}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
