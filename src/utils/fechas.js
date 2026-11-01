export const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
export const MESES_CORTOS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
export const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
export const DIAS_CORTOS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const pad = (n) => String(n).padStart(2, '0')

export const clave = (anio, mes, dia) => `${anio}-${pad(mes + 1)}-${pad(dia)}`

export function aFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)

/** viernes 30 de octubre de 2026 */
export function fechaLarga(iso) {
  const f = aFecha(iso)
  return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`
}
/** viernes 30 de octubre */
export function fechaSeleccionada(iso) {
  const f = aFecha(iso)
  return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`
}
/** Viernes 30 oct. 2026 */
export function fechaMedia(iso) {
  const f = aFecha(iso)
  return `${cap(DIAS[f.getDay()])} ${f.getDate()} ${MESES_CORTOS[f.getMonth()]}. ${f.getFullYear()}`
}
/** Vie. 30 oct. 2026 */
export function fechaCorta(iso) {
  const f = aFecha(iso)
  return `${DIAS_CORTOS[f.getDay()]}. ${f.getDate()} ${MESES_CORTOS[f.getMonth()]}. ${f.getFullYear()}`
}
/** viernes 30 oct. */
export function diaMes(iso) {
  const f = aFecha(iso)
  return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES_CORTOS[f.getMonth()]}.`
}
/** 30 de octubre */
export function diaDeMes(iso) {
  const f = aFecha(iso)
  return `${f.getDate()} de ${MESES[f.getMonth()]}`
}
/** 30 oct. */
export function diaMesCorto(iso) {
  const f = aFecha(iso)
  return `${f.getDate()} ${MESES_CORTOS[f.getMonth()]}.`
}
/** 30 octubre 2026 */
export function fechaSimple(iso) {
  const f = aFecha(iso)
  return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`
}
/** VIERNES 30 OCT. 2026 */
export function fechaMayus(iso) {
  return fechaMedia(iso).toUpperCase()
}

/** Semanas (lunes a domingo) de un mes. Celdas vacías = null */
export function matrizMes(anio, mes) {
  const primero = new Date(anio, mes, 1)
  const offset = (primero.getDay() + 6) % 7
  const total = new Date(anio, mes + 1, 0).getDate()
  const celdas = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) celdas.push(d)
  while (celdas.length % 7 !== 0) celdas.push(null)
  const semanas = []
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7))
  return semanas
}

/** Los siete días (lunes a domingo) de la semana que contiene `iso` */
export function diasDeSemana(iso) {
  const f = aFecha(iso)
  const lunes = new Date(f)
  lunes.setDate(f.getDate() - ((f.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return clave(d.getFullYear(), d.getMonth(), d.getDate())
  })
}

/** Todos los días de octubre de 2026 (o del mes indicado) para los selectores de fecha */
export function diasDelMes(anio, mes) {
  const total = new Date(anio, mes + 1, 0).getDate()
  return Array.from({ length: total }, (_, i) => clave(anio, mes, i + 1))
}
