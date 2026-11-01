import Icono from '../ui/Icono.jsx'
import { RESTAURANTE } from '../../data/seed.js'

export default function InfoRestaurante({ titulo = RESTAURANTE.lema }) {
  return (
    <div className="bloque-restaurante">
      <h2>{titulo}</h2>
      <p>{RESTAURANTE.direccion.split(' · ').join(' · ')}</p>
      <p className="dato"><Icono nombre="reloj" tamano={18} grosor={1.8} /><span className="muted">{RESTAURANTE.servicio}</span></p>
      <small>Reservas de hasta {RESTAURANTE.maxPersonas} personas.</small>
    </div>
  )
}
