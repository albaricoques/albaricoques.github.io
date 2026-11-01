import Icono from './Icono.jsx'

const ICONO_POR_TIPO = { exito: 'check-circulo', error: 'alerta-circulo', info: 'info', neutro: 'info' }

/** Aviso: exito · error · info · neutro */
export default function Aviso({ tipo = 'exito', titulo, icono, plano = false, children }) {
  const clases = ['aviso', `aviso--${tipo}`, plano && 'aviso--plano'].filter(Boolean).join(' ')
  return (
    <div className={clases} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono nombre={icono ?? ICONO_POR_TIPO[tipo]} tamano={20} />
      <div>
        {titulo && <p className="aviso__titulo">{titulo}</p>}
        {children && <p className="aviso__texto">{children}</p>}
      </div>
    </div>
  )
}
