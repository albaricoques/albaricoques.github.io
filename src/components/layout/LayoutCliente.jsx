import { useEffect } from 'react'
import EncabezadoCliente from './EncabezadoCliente.jsx'
import PiePagina from './PiePagina.jsx'
import Stepper from '../ui/Stepper.jsx'

export default function LayoutCliente({ paso = 0, eyebrow = 'Reserva tu mesa', titulo, descripcion, hero = false, children }) {
  useEffect(() => {
    document.title = `${titulo} · La Sobremesa`
  }, [titulo])

  return (
    <div className="cliente">
      <EncabezadoCliente />
      <main className="cliente__principal">
        <Stepper actual={paso} />
        <div className={`cliente__intro ${hero ? 'cliente__intro--hero' : ''}`.trim()}>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
        {children}
      </main>
      <PiePagina />
    </div>
  )
}
