import { useEffect, useMemo, useState } from 'react'
import LayoutCliente from '../../components/layout/LayoutCliente.jsx'
import Boton from '../../components/ui/Boton.jsx'
import Campo from '../../components/ui/Campo.jsx'
import Aviso from '../../components/ui/Aviso.jsx'
import Icono from '../../components/ui/Icono.jsx'
import Tarjeta from '../../components/ui/Tarjeta.jsx'
import AccionEdicion from '../../components/ui/AccionEdicion.jsx'
import SelectorNumerico from '../../components/ui/SelectorNumerico.jsx'
import ImagenRestaurante from '../../components/ui/ImagenRestaurante.jsx'
import Calendario from '../../components/reservas/Calendario.jsx'
import FranjaHoraria from '../../components/reservas/FranjaHoraria.jsx'
import ResumenReserva from '../../components/reservas/ResumenReserva.jsx'
import InfoRestaurante from '../../components/reservas/InfoRestaurante.jsx'
import { useReservas } from '../../hooks/useReservas.jsx'
import { FECHA_DEMO, HORAS_CLIENTE, RESTAURANTE } from '../../data/seed.js'
import { asignarMesa, cupoOnline, validarCorreo, validarTelefono, hayTexto } from '../../utils/disponibilidad.js'
import { crearIcs, horaAmPm, minutos } from '../../utils/agenda.js'
import { diasDelMes, fechaCorta, fechaLarga, diaDeMes, fechaSeleccionada } from '../../utils/fechas.js'

const IMAGEN = '/img/restaurante.jpg'
const OPCIONES_FECHA = diasDelMes(2026, 9).map((d) => ({ valor: d, texto: fechaCorta(d) }))
const OPCIONES_HORA = HORAS_CLIENTE.map((h) => ({ valor: h, texto: `${h} h` }))
const PASO_STEPPER = { inicio: 0, fecha: 0, alternativas: 0, personas: 1, datos: 2, resumen: 3, listo: 4 }
const mayus = (t) => t.replace(/^./, (c) => c.toUpperCase())

export default function FlujoReserva() {
  const { reservas, bloqueos, crearReserva } = useReservas()
  const [paso, setPaso] = useState('inicio')
  const [datos, setDatos] = useState({
    fecha: FECHA_DEMO, hora: '20:00', personas: 4,
    nombre: '', telefono: '+34 ', correo: '', notas: '',
  })
  const [tocados, setTocados] = useState({})
  const [confirmada, setConfirmada] = useState(null)
  const [errorFinal, setErrorFinal] = useState(null)
  const [mensajeCompartir, setMensajeCompartir] = useState('')

  const poner = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))
  const cupo = (hora, fecha = datos.fecha) => cupoOnline({ reservas, fecha, hora })
  const agotada = (hora) => cupo(hora) === 0
  const horaAgotada = agotada(datos.hora)

  // useEffect: cada cambio de paso vuelve arriba y limpia mensajes del paso anterior
  useEffect(() => {
    window.scrollTo({ top: 0 })
    setMensajeCompartir('')
  }, [paso])

  const ir = (p) => { setErrorFinal(null); setPaso(p) }

  const alternativas = useMemo(
    () => HORAS_CLIENTE.filter((h) => h !== datos.hora && cupoOnline({ reservas, fecha: datos.fecha, hora: h }) > 0),
    [reservas, datos.fecha, datos.hora],
  )

  // Mesa disponible para el grupo en la hora elegida
  const mesaParaGrupo = (personas = datos.personas) => asignarMesa({ reservas, bloqueos, fecha: datos.fecha, hora: datos.hora, personas })

  const errores = {
    nombre: hayTexto(datos.nombre) ? null : 'Escribe tu nombre completo.',
    telefono: validarTelefono(datos.telefono) ? null : 'Usa prefijo y 9 cifras, como +34 612 345 678.',
    correo: validarCorreo(datos.correo) ? null : 'Introduce un correo válido, como nombre@dominio.com.',
  }
  const datosValidos = !errores.nombre && !errores.telefono && !errores.correo
  const tocar = (c) => () => setTocados((t) => ({ ...t, [c]: true }))
  const errorDe = (c) => (tocados[c] ? errores[c] : null)

  const confirmar = () => {
    // Se vuelve a validar la disponibilidad justo antes de registrar
    const mesa = mesaParaGrupo()
    if (agotada(datos.hora) || !mesa) {
      setErrorFinal(`Lo sentimos, a las ${datos.hora} ya no queda mesa para ${datos.personas} personas. Elige otro horario.`)
      setPaso('fecha')
      return
    }
    const creada = crearReserva({
      fecha: datos.fecha, hora: datos.hora, personas: datos.personas, mesa, cliente: datos.nombre.trim(),
      telefono: datos.telefono, correo: datos.correo, notas: datos.notas, origen: 'web', estado: 'confirmada',
    })
    setConfirmada(creada)
    setPaso('listo')
  }

  const guardarCalendario = () => {
    const ics = crearIcs(confirmada)
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `reserva-${confirmada.codigo}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  const compartir = async () => {
    const texto = `Reserva en ${RESTAURANTE.nombre}: ${fechaLarga(confirmada.fecha)} a las ${confirmada.hora} h, ${confirmada.personas} personas. Código ${confirmada.codigo}.`
    try {
      if (navigator.share) await navigator.share({ title: RESTAURANTE.nombre, text: texto })
      else { await navigator.clipboard.writeText(texto); setMensajeCompartir('Detalles copiados al portapapeles.') }
    } catch {
      setMensajeCompartir('No se pudo compartir. Copia el código a mano.')
    }
  }

  const propsPaso = { paso: PASO_STEPPER[paso] }
  const resumen = { fecha: datos.fecha, hora: datos.hora, personas: datos.personas }

  /* ---------- C01 · Una mesa para compartir ---------- */
  if (paso === 'inicio') {
    return (
      <LayoutCliente {...propsPaso} hero titulo="Una mesa para compartir" eyebrow="Reserva tu mesa"
        descripcion="Reserva en La Sobremesa. Elige cuándo venir y comprueba la disponibilidad antes de dejar tus datos.">
        <div className="rejilla-cliente rejilla-cliente--hero">
          <div className="columna" style={{ gap: 32 }}>
            <ImagenRestaurante src={IMAGEN} ratio="708 / 360" />
            <InfoRestaurante />
          </div>
          <Tarjeta sombra>
            <h2 className="tarjeta__titulo" style={{ marginBottom: 20 }}>Encuentra tu mesa</h2>
            <div className="formulario" style={{ gap: 20 }}>
              <Campo tipo="select" etiqueta="Fecha" value={datos.fecha} onChange={(e) => poner('fecha', e.target.value)} opciones={OPCIONES_FECHA} />
              <Campo tipo="select" etiqueta="Hora solicitada" value={datos.hora} onChange={(e) => poner('hora', e.target.value)} opciones={OPCIONES_HORA} />
              <Boton variante="primario" bloque onClick={() => ir('fecha')}>Reservar Mesa</Boton>
              <p className="muted" style={{ fontSize: 12 }}>Consulta la disponibilidad en el siguiente paso. Aún no hay una mesa asignada.</p>
            </div>
          </Tarjeta>
        </div>
      </LayoutCliente>
    )
  }

  /* ---------- C02 · Elige fecha y hora ---------- */
  if (paso === 'fecha') {
    const estadoFranja = (h) => (agotada(h) ? 'agotada' : h === datos.hora ? 'seleccionada' : 'disponible')
    return (
      <LayoutCliente {...propsPaso} titulo="Elige fecha y hora"
        descripcion={`${mayus(fechaLarga(datos.fecha))}. Consultamos el cupo antes de pedir tus datos.`}>
        {errorFinal && <Aviso tipo="error" titulo="Horario no disponible">{errorFinal}</Aviso>}
        <div className="rejilla-cliente rejilla-cliente--fecha" style={{ gridTemplateColumns: 'minmax(0,1fr) 344px' }}>
          <div className="columna" style={{ gap: 16 }}>
            <h2 className="titulo-seccion">Fecha</h2>
            <Calendario amplio fecha={datos.fecha} onSeleccionar={(d) => poner('fecha', d)} />
            <p className="muted" style={{ fontSize: 13 }}>Seleccionado: {fechaLarga(datos.fecha)}.</p>
          </div>
          <div className="columna" style={{ gap: 16 }}>
            <h2 className="titulo-seccion">Horarios para el {diaDeMes(datos.fecha)}</h2>
            <div className="franjas" role="group" aria-label="Horarios disponibles">
              {HORAS_CLIENTE.map((h) => (
                <FranjaHoraria key={h} hora={h} estado={estadoFranja(h)} solicitada={h === datos.hora} onSeleccionar={(x) => poner('hora', x)} />
              ))}
            </div>
            {horaAgotada ? (
              <>
                <Aviso tipo="error" titulo={`Sin disponibilidad a las ${datos.hora}`}>La franja está completa. Elige otro horario para continuar.</Aviso>
                <Boton variante="primario" bloque disabled>Continuar · sin cupo</Boton>
                <Boton bloque onClick={() => ir('alternativas')}>Ver horarios alternativos</Boton>
              </>
            ) : (
              <>
                <Aviso tipo="exito" titulo={`Disponible a las ${datos.hora}`}>Hay cupo en esta franja. Puedes continuar con las personas.</Aviso>
                <Boton variante="primario" bloque onClick={() => ir('personas')}>Continuar con las {datos.hora}</Boton>
              </>
            )}
          </div>
        </div>
      </LayoutCliente>
    )
  }

  /* ---------- C03 · Horarios alternativos ---------- */
  if (paso === 'alternativas') {
    const elegida = alternativas.includes(datos.hora) ? datos.hora : null
    // Si la hora original sigue agotada, se preselecciona la alternativa más cercana
    const propuesta = elegida ?? [...alternativas].sort((a, b) => Math.abs(minutos(a) - minutos(datos.hora)) - Math.abs(minutos(b) - minutos(datos.hora)) || minutos(b) - minutos(a))[0]
    const original = HORAS_CLIENTE.find(agotada) && horaAgotada ? datos.hora : null
    return (
      <LayoutCliente {...propsPaso} titulo="Horarios alternativos"
        descripcion={`El horario de las ${horaAmPm(datos.hora)} está agotado. Tenemos otras mesas para ti en la misma fecha.`}>
        <div className="rejilla-cliente">
          <div className="columna">
            <Aviso tipo="error" titulo={`${original ?? datos.hora} · Horario agotado`}>Elige una alternativa antes de continuar con las personas y tus datos.</Aviso>
            {alternativas.length === 0 ? (
              <Aviso tipo="neutro" titulo="Sin horarios libres este día">Prueba con otra fecha.</Aviso>
            ) : (
              <AlternativasLista fecha={datos.fecha} alternativas={alternativas} original={original ?? datos.hora} propuesta={propuesta} onContinuar={(h) => { poner('hora', h); ir('personas') }} />
            )}
            <Boton bloque onClick={() => ir('fecha')}>Cambiar fecha</Boton>
          </div>
          <div className="columna">
            <ImagenRestaurante src={IMAGEN} ratio="344 / 220" />
            <InfoRestaurante />
          </div>
        </div>
      </LayoutCliente>
    )
  }

  /* ---------- C04 · ¿Cuántas personas vienen? ---------- */
  if (paso === 'personas') {
    const mesa = mesaParaGrupo()
    return (
      <LayoutCliente {...propsPaso} titulo="¿Cuántas personas vienen?"
        descripcion={`El horario de las ${datos.hora} tiene cupo. Ahora indica el tamaño de tu grupo.`}>
        <div className="rejilla-cliente">
          <div className="columna">
            <Tarjeta>
              <h2 className="tarjeta__titulo" style={{ marginBottom: 16 }}>Número de personas</h2>
              <SelectorNumerico valor={datos.personas} min={1} max={RESTAURANTE.maxPersonas} onChange={(n) => poner('personas', n)} etiqueta="Número de personas" />
              <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>Mínimo 1 · Máximo {RESTAURANTE.maxPersonas} personas por reserva</p>
            </Tarjeta>
            {mesa ? (
              <Aviso tipo="exito" titulo={`${datos.personas} persona${datos.personas === 1 ? '' : 's'} · Cupo disponible`}>
                Puedes reservar hasta {RESTAURANTE.maxPersonas} personas. En el límite, el botón + se deshabilita.
              </Aviso>
            ) : (
              <Aviso tipo="error" titulo={`Sin mesa para ${datos.personas} personas`}>
                No queda ninguna mesa con esa capacidad a las {datos.hora}. Reduce el grupo o elige otro horario.
              </Aviso>
            )}
            <Boton variante="primario" bloque disabled={!mesa} onClick={() => ir('datos')}>Continuar con {datos.personas} persona{datos.personas === 1 ? '' : 's'}</Boton>
            <Boton bloque onClick={() => ir('fecha')}>Volver a horarios</Boton>
          </div>
          <ResumenReserva {...resumen} />
        </div>
      </LayoutCliente>
    )
  }

  /* ---------- C05 · Tus datos de contacto ---------- */
  if (paso === 'datos') {
    return (
      <LayoutCliente {...propsPaso} titulo="Tus datos de contacto"
        descripcion={`${fechaCorta(datos.fecha)} · ${datos.hora} h · ${datos.personas} personas. Solo necesitamos estos datos para gestionar tu reserva.`}>
        <div className="rejilla-cliente">
          <div className="columna">
            <Tarjeta>
              <form className="formulario" noValidate onSubmit={(e) => { e.preventDefault(); if (datosValidos) ir('resumen') }}>
                <p className="formulario__obligatorios" style={{ fontSize: 12 }}>* Campos obligatorios</p>
                <Campo etiqueta="Nombre completo" requerido placeholder="Lucía Martínez" value={datos.nombre} onChange={(e) => poner('nombre', e.target.value)} onBlur={tocar('nombre')} error={errorDe('nombre')} autoComplete="name" />
                <div className="formulario__fila">
                  <Campo etiqueta="Teléfono" requerido type="tel" inputMode="tel" placeholder="+34 612 345 678" value={datos.telefono} onChange={(e) => poner('telefono', e.target.value)} onBlur={tocar('telefono')} error={errorDe('telefono')} ok={!errores.telefono ? 'Correcto · prefijo y 9 cifras' : null} autoComplete="tel" />
                  <Campo etiqueta="Correo electrónico" requerido tipo="email" placeholder="lucia.martinez@ejemplo.com" value={datos.correo} onChange={(e) => poner('correo', e.target.value)} onBlur={tocar('correo')} error={errorDe('correo')} ok={!errores.correo ? 'Formato de correo válido' : null} autoComplete="email" />
                </div>
                <Campo etiqueta="Notas especiales (opcional)" placeholder="Sin solicitudes especiales" value={datos.notas} onChange={(e) => poner('notas', e.target.value)} ayuda="Alergias, accesibilidad u otras necesidades." />
              </form>
            </Tarjeta>
            {datosValidos ? (
              <Aviso tipo="exito" titulo="Datos válidos · Puedes continuar">Tus datos se utilizarán únicamente para gestionar esta reserva. No hace falta crear una cuenta.</Aviso>
            ) : (
              <Aviso tipo="neutro" titulo="Completa los datos obligatorios">Continuar bloqueado hasta corregirlo. Necesitamos nombre, teléfono y correo válidos.</Aviso>
            )}
            <Boton variante="primario" bloque disabled={!datosValidos} onClick={() => ir('resumen')}>Revisar reserva</Boton>
            <Boton bloque onClick={() => ir('personas')}>Volver a personas</Boton>
          </div>
          <ResumenReserva {...resumen} />
        </div>
      </LayoutCliente>
    )
  }

  /* ---------- C06 · Revisa tu reserva ---------- */
  if (paso === 'resumen') {
    return (
      <LayoutCliente {...propsPaso} titulo="Revisa tu reserva"
        descripcion="Comprueba los detalles antes de confirmar. Puedes corregir cualquier dato sin empezar de nuevo.">
        <div className="rejilla-cliente">
          <ResumenReserva {...datos} completo>
            <div>
              <AccionEdicion etiqueta="Fecha y hora" onEditar={() => ir('fecha')} />
              <AccionEdicion etiqueta="Número de personas" onEditar={() => ir('personas')} />
              <AccionEdicion etiqueta="Datos de contacto" onEditar={() => ir('datos')} />
            </div>
          </ResumenReserva>
          <div className="columna" style={{ gap: 20 }}>
            <Aviso tipo="exito" titulo="Disponibilidad verificada">
              {diaDeMes(datos.fecha)} · {datos.hora} h · {datos.personas} personas. Tu reserva quedará registrada al confirmar.
            </Aviso>
            <Boton variante="primario" bloque onClick={confirmar}>Confirmar Reserva</Boton>
            <p className="muted" style={{ fontSize: 12 }}>Comprueba los detalles. Aún no se ha confirmado la reserva.</p>
            <ImagenRestaurante src={IMAGEN} ratio="344 / 200" />
          </div>
        </div>
      </LayoutCliente>
    )
  }

  /* ---------- C07 · Tu mesa está asegurada ---------- */
  return (
    <LayoutCliente {...propsPaso} eyebrow="Nos vemos pronto" titulo="Tu mesa está asegurada"
      descripcion={`Reserva confirmada, ${confirmada.cliente.split(' ')[0]}. Te esperamos en ${RESTAURANTE.nombre}.`}>
      <div className="rejilla-cliente">
        <div className="columna">
          <div className="confirmacion">
            <Icono nombre="check-circulo" tamano={36} grosor={1.3} />
            <p className="confirmacion__etiqueta">Reserva confirmada</p>
            <p className="confirmacion__sub">Código de reserva</p>
            <p className="confirmacion__codigo" aria-label={`Código ${confirmada.codigo}`}>{confirmada.codigo}</p>
            <p className="confirmacion__sub">Muestra este código al llegar.</p>
          </div>
          <Boton variante="primario" bloque onClick={guardarCalendario}>Guardar en calendario</Boton>
          <Boton bloque onClick={compartir}>Compartir</Boton>
          {mensajeCompartir && <p role="status" className="muted" style={{ fontSize: 12 }}>{mensajeCompartir}</p>}
          <p className="muted" style={{ fontSize: 12 }}>
            Confirmación enviada a {confirmada.correo}. Para modificar o cancelar, llama al {RESTAURANTE.telefono} e indica tu código.
          </p>
          <InfoRestaurante />
        </div>
        <ResumenReserva {...confirmada} completo />
      </div>
    </LayoutCliente>
  )
}

/** Lista de horarios alternativos con selección local y botón de continuar */
function AlternativasLista({ fecha, alternativas, original, propuesta, onContinuar }) {
  const [elegida, setElegida] = useState(propuesta)
  const diff = minutos(elegida) - minutos(original)
  const texto = `${Math.abs(diff)} minutos ${diff > 0 ? 'más tarde' : 'antes'}`
  return (
    <>
      <Tarjeta sombra>
        <h2 className="tarjeta__titulo" style={{ marginBottom: 16 }}>{mayus(fechaSeleccionada(fecha))}</h2>
        <div className="franjas" role="group" aria-label="Horarios alternativos" style={{ gap: 18 }}>
          {alternativas.map((h) => (
            <FranjaHoraria key={h} hora={h} compacta estado={h === elegida ? 'seleccionada' : 'disponible'} onSeleccionar={setElegida} />
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>{texto} · Cupo disponible para continuar.</p>
      </Tarjeta>
      <Boton variante="primario" bloque onClick={() => onContinuar(elegida)}>Continuar con las {elegida}</Boton>
    </>
  )
}
