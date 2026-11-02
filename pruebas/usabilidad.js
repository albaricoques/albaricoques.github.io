// Pruebas de usabilidad con usuarios simulados sobre La Sobremesa.
// Uso: NODE_PATH=$(npm root -g) node usabilidad.js <ronda>
const { chromium } = require('playwright')
const fs = require('fs')

const BASE = 'http://localhost:4173/'
const ronda = process.argv[2] || '1'
const DESKTOP = { width: 1280, height: 900 }
const MOVIL = { width: 390, height: 844 }

class Usuario {
  constructor(page, nombre) {
    this.p = page
    this.nombre = nombre
    this.clics = 0
    this.escritos = 0
    this.pantallas = 0
    this.notas = []
    this.auditorias = []
  }
  async clic(loc) { await loc.click({ timeout: 4000 }); this.clics++; await this.p.waitForTimeout(60) }
  async escribir(loc, texto) { await loc.fill(texto, { timeout: 4000 }); this.escritos++ }
  async visible(texto) { return this.p.getByText(texto, { exact: false }).first().isVisible().catch(() => false) }
  nota(t) { this.notas.push(t) }
  async pantalla(nombre) { this.pantallas++; this.auditorias.push({ pantalla: nombre, ...(await auditar(this.p)) }) }
}

async function auditar(page) {
  return page.evaluate(() => {
    const visibles = [...document.querySelectorAll('a[href],button,input,select,textarea')].filter((e) => {
      const r = e.getBoundingClientRect()
      const s = getComputedStyle(e)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
    })
    const menor = (n) => visibles.filter((e) => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height) < n })
    const freq = {}
    menor(44).forEach((e) => { const k = (typeof e.className === 'string' && e.className.split(' ')[0]) || e.tagName.toLowerCase(); freq[k] = (freq[k] || 0) + 1 })
    const sinEtiqueta = [...document.querySelectorAll('input,select,textarea')].filter((e) => !(e.labels && e.labels.length) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).length
    return {
      desborde: document.documentElement.scrollWidth > window.innerWidth + 1,
      h1: document.querySelectorAll('h1').length,
      interactivos: visibles.length,
      menorQue44: menor(44).length,
      menorQue24: menor(24).length,
      clasesPequenas: freq,
      sinEtiqueta,
    }
  })
}

async function nuevaSesion(browser, viewport) {
  const ctx = await browser.newContext({ viewport, hasTouch: viewport.width < 600 })
  const page = await ctx.newPage()
  const errores = []
  page.on('pageerror', (e) => errores.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()) })
  await page.goto(BASE)
  await page.evaluate(() => localStorage.clear())
  return { ctx, page, errores }
}

async function tarea(browser, viewport, nombre, descripcion, fn) {
  const { ctx, page, errores } = await nuevaSesion(browser, viewport)
  const u = new Usuario(page, nombre)
  let completada = false
  let fallo = null
  try { completada = await fn(u, page) } catch (e) { fallo = e.message.split('\n')[0] }
  const r = {
    perfil: nombre, tarea: descripcion, viewport: `${viewport.width}px`, completada: !!completada, fallo,
    clics: u.clics, camposEscritos: u.escritos, pantallas: u.pantallas, notas: u.notas, errorConsola: errores.length,
    auditorias: u.auditorias,
  }
  await ctx.close()
  return r
}

const reservar = (page) => page.getByRole('button', { name: 'Reservar Mesa' })
const sumaPersonas = (page) => page.getByRole('button', { name: 'Añadir una persona' })
const restaPersonas = (page) => page.getByRole('button', { name: 'Quitar una persona' })

async function flujoClienteDirecto(u, page) {
  await page.goto(BASE + '#/'); await u.pantalla('C01 inicio')
  await u.clic(reservar(page)); await u.pantalla('C02 fecha y hora')
  const anchoCal = await page.locator('.calendario').first().evaluate((e) => Math.round(e.getBoundingClientRect().width))
  u.nota(`Ancho del calendario en el paso Fecha: ${anchoCal} px (viewport ${page.viewportSize().width} px)`)
  if (await u.visible('Sin disponibilidad a las 20:00')) u.nota('Aviso de franja agotada visible a la primera')
  await u.clic(page.getByRole('button', { name: 'Ver horarios alternativos' })); await u.pantalla('C03 alternativas')
  await u.clic(page.getByRole('button', { name: /Continuar con las 20:30/ })); await u.pantalla('C04 personas')
  await u.clic(page.getByRole('button', { name: /^Continuar con \d persona/ })); await u.pantalla('C05 datos')
  await u.escribir(page.getByLabel('Nombre completo *'), 'Lucía Martínez')
  await u.escribir(page.getByLabel('Teléfono *'), '+34 612 345 678')
  await u.escribir(page.getByLabel('Correo electrónico *'), 'lucia.martinez@ejemplo.com')
  await u.clic(page.getByRole('button', { name: 'Revisar reserva' })); await u.pantalla('C06 resumen')
  await u.clic(page.getByRole('button', { name: 'Confirmar Reserva' })); await u.pantalla('C07 confirmación')
  return page.getByText('Tu mesa está asegurada').first().isVisible()
}

async function flujoClienteErrores(u, page) {
  await page.goto(BASE + '#/')
  await u.clic(reservar(page))
  const continuar = page.getByRole('button', { name: /Continuar · sin cupo/ })
  u.nota(`Botón "Continuar · sin cupo" deshabilitado: ${await continuar.isDisabled()}`)
  await u.clic(page.getByRole('button', { name: 'Ver horarios alternativos' }))
  await u.clic(page.getByRole('button', { name: /Continuar con las 20:30/ }))
  // Grupo grande: la web anuncia "hasta 8 personas"
  for (let i = 0; i < 4; i++) await u.clic(sumaPersonas(page))
  const sinMesa = await u.visible('Sin mesa para 8 personas')
  const botonGrupo = page.getByRole('button', { name: /^Continuar con \d persona/ })
  const bloqueado = await botonGrupo.isDisabled()
  u.nota(`Grupo de 8 personas: aviso "Sin mesa" = ${sinMesa}; botón continuar bloqueado = ${bloqueado}`)
  const grupoGrandeBloqueado = sinMesa && bloqueado
  for (let i = 0; i < 4; i++) await u.clic(restaPersonas(page))
  await u.clic(page.getByRole('button', { name: /^Continuar con \d persona/ }))
  // Botón Atrás del navegador estando en el paso "Datos"
  const antesAtras = page.url()
  await page.goBack().catch(() => {})
  await page.waitForTimeout(250)
  const enDatos = await u.visible('Tus datos de contacto')
  const enPersonas = await u.visible('¿Cuántas personas vienen?')
  u.nota(`Atrás del navegador en "Datos": vuelve al paso anterior (Personas) = ${enPersonas}; se queda en el mismo paso = ${enDatos}; la URL cambia entre pasos = ${antesAtras !== page.url() && enPersonas}`)
  if (!enDatos) { await page.goForward().catch(() => {}); await page.waitForTimeout(250) }
  if (!(await u.visible('Tus datos de contacto'))) { await page.goto(BASE + '#/'); return false }
  // Datos con errores típicos
  await u.escribir(page.getByLabel('Nombre completo *'), 'Lu')
  await u.escribir(page.getByLabel('Teléfono *'), '612345678')
  await u.escribir(page.getByLabel('Correo electrónico *'), 'lucia@')
  await page.getByLabel('Nombre completo *').focus(); await page.getByLabel('Teléfono *').focus(); await page.getByLabel('Correo electrónico *').focus(); await page.getByLabel('Notas especiales (opcional)').focus()
  const errTel = await u.visible('Usa prefijo y 9 cifras')
  const errMail = await u.visible('Introduce un correo válido')
  const revisar = page.getByRole('button', { name: 'Revisar reserva' })
  u.nota(`Errores en línea: teléfono = ${errTel}, correo = ${errMail}; "Revisar reserva" bloqueado = ${await revisar.isDisabled()}`)
  await u.escribir(page.getByLabel('Nombre completo *'), 'Lucía Martínez')
  await u.escribir(page.getByLabel('Teléfono *'), '+34 612 345 678')
  await u.escribir(page.getByLabel('Correo electrónico *'), 'lucia.martinez@ejemplo.com')
  await u.clic(revisar)
  // Corrección desde el resumen
  await u.clic(page.getByRole('button', { name: /Editar/ }).nth(2))
  const volvioDatos = await u.visible('Tus datos de contacto')
  u.nota(`"Editar datos de contacto" desde el resumen lleva a los datos = ${volvioDatos}`)
  await u.clic(page.getByRole('button', { name: 'Revisar reserva' }))
  await u.clic(page.getByRole('button', { name: 'Confirmar Reserva' }))
  const fin = await page.getByText('Tu mesa está asegurada').first().isVisible()
  // Después de confirmar
  const otraReserva = await page.getByRole('button', { name: /otra reserva|nueva reserva/i }).count() + await page.getByRole('link', { name: /otra reserva|nueva reserva/i }).count()
  u.nota(`Tras confirmar hay opción de hacer otra reserva = ${otraReserva > 0}`)
  u.grupoGrandeBloqueado = grupoGrandeBloqueado
  u.notaGrupo = grupoGrandeBloqueado
  return fin
}

async function adminNuevaReserva(u, page) {
  await page.goto(BASE + '#/admin'); await u.pantalla('A01 panel')
  await u.clic(page.locator('.panel__botones').getByRole('link', { name: 'Nueva reserva' })); await u.pantalla('A03 nueva reserva')
  const conflicto = await u.visible('Conflicto de disponibilidad')
  u.nota(`Conflicto M04 20:00 detectado al abrir = ${conflicto}`)
  const guardar = page.getByRole('button', { name: /^Guardar reserva/ })
  u.nota(`Texto del botón Guardar con conflicto: "${(await guardar.innerText()).trim()}" (deshabilitado = ${await guardar.isDisabled()})`)
  await u.clic(page.getByRole('button', { name: /Usar alternativa/ }))
  const disponible = await u.visible('Disponible · Sin conflictos')
  u.nota(`Tras aplicar la alternativa aparece "Disponible · Sin conflictos" = ${disponible}`)
  // Estado "solo faltan datos": ¿se explica por qué no se puede guardar?
  const textoBoton = (await guardar.innerText()).trim()
  const explica = await page.getByText(/completa|falta|obligatorio.*para guardar|rellena/i).first().isVisible().catch(() => false)
  u.nota(`Con datos vacíos: botón "${textoBoton}" deshabilitado = ${await guardar.isDisabled()}; el motivo se explica en pantalla = ${explica}`)
  await u.escribir(page.getByLabel('Nombre completo *'), 'Lucía Martínez')
  await u.escribir(page.getByLabel('Teléfono *'), '+34 612 345 678')
  await u.escribir(page.getByLabel('Correo electrónico *'), 'lucia.martinez@ejemplo.com')
  await u.clic(guardar)
  return page.getByText(/Reserva SM-\d+ creada/).first().isVisible()
}

async function adminEditarCancelar(u, page) {
  await page.goto(BASE + '#/admin'); await u.pantalla('A01 panel')
  await u.clic(page.locator('.panel__botones').getByRole('link', { name: 'Editar' })); await u.pantalla('A04 editar')
  let esAna = await page.getByText(/SM-3043/).first().isVisible().catch(() => false)
  u.nota(`Al pulsar "Editar" en el panel se abre la reserva de Ana López (SM-3043) = ${esAna}`)
  if (!esAna) {
    const selector = page.getByLabel('Reserva a editar')
    if (await selector.count()) {
      const opts = await selector.locator('option').allInnerTexts()
      await selector.selectOption({ index: opts.findIndex((t) => t.includes('Ana')) })
      u.clics++
      u.nota('Se usó el selector "Reserva a editar"')
    } else {
      u.nota('No hay forma de elegir otra reserva en esta pantalla: el usuario debe dar un rodeo por Consultar reservas')
      await u.clic(page.getByRole('link', { name: 'Consultar reservas' }).first())
      await u.pantalla('A02 calendario y reservas')
      await u.clic(page.locator('tr', { hasText: 'Ana López' }).getByRole('link'))
      await u.pantalla('A04 editar')
    }
  }
  esAna = await page.getByText(/SM-3043/).first().isVisible().catch(() => false)
  if (!esAna) return false
  await u.clic(page.getByRole('button', { name: 'Cancelar reserva' }))
  await u.clic(page.getByRole('button', { name: 'Sí, cancelar reserva' }))
  const cancelada = await page.getByText(/Tras confirmar cancelación/).first().isVisible()
  const sigueBoton = await page.getByRole('button', { name: 'Sí, cancelar reserva' }).count()
  u.nota(`Reserva cancelada con aviso = ${cancelada}; el botón de cancelar desaparece (evita doble cancelación) = ${sigueBoton === 0}`)
  return cancelada
}

async function adminEditarConflicto(u, page) {
  await page.goto(BASE + '#/admin/editar/SM-3042'); await u.pantalla('A04 editar')
  const hora = page.getByLabel('Hora *')
  await hora.selectOption('20:00'); u.clics++
  const conflicto = await u.visible('Conflicto de disponibilidad')
  const guardar = page.getByRole('button', { name: 'Guardar cambios' })
  u.nota(`Cambiar a 20:00 (M04 ocupada): conflicto = ${conflicto}, Guardar deshabilitado = ${await guardar.isDisabled()}`)
  await hora.selectOption('21:00'); u.clics++
  const ok = await u.visible('Disponible · Sin conflictos')
  u.nota(`Cambiar a 21:00: disponible = ${ok}, Guardar habilitado = ${await guardar.isEnabled()}`)
  await u.clic(guardar)
  return page.getByText('Cambios guardados').first().isVisible()
}

async function coherenciaEntreVistas(u, page) {
  await flujoClienteDirecto(u, page)
  const codigo = (await page.locator('.confirmacion__codigo').innerText()).trim()
  await page.goto(BASE + '#/admin'); await page.waitForTimeout(200)
  const total = (await page.locator('.indicador__valor').first().innerText()).trim()
  const fila = await page.locator('tr', { hasText: codigo }).count()
  u.nota(`Reserva ${codigo} hecha como cliente: el panel muestra ${total} reservas del día (antes 25) y la fila en la tabla = ${fila > 0}`)
  return total === '26' && fila > 0
}

async function navegacionCruzada(u, page) {
  await page.goto(BASE + '#/'); await u.pantalla('Cliente')
  const enlaceAdmin = await page.getByRole('link', { name: /admin/i }).count()
  u.nota(`Desde la vista de cliente hay un enlace visible hacia administración = ${enlaceAdmin > 0}`)
  await page.goto(BASE + '#/admin'); await u.pantalla('Admin')
  const enlaceCliente = await page.getByRole('link', { name: /cliente|ver reservas como|sitio público/i }).count()
  u.nota(`Desde administración hay un enlace visible hacia la vista de cliente = ${enlaceCliente > 0}`)
  return enlaceAdmin > 0 && enlaceCliente > 0
}

async function auditoriaAdmin(u, page, tag) {
  for (const [nombre, h] of [['A01 panel', '#/admin'], ['A02 calendario', '#/admin/reservas'], ['A03 nueva', '#/admin/nueva'], ['A04 editar', '#/admin/editar/SM-3042']]) {
    await page.goto(BASE + h); await page.waitForTimeout(150)
    await u.pantalla(`${nombre} ${tag}`)
  }
  return true
}

async function teclado(u, page) {
  await page.goto(BASE + '#/')
  let pulsaciones = 0
  let alcanzado = false
  const sinIndicador = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab'); pulsaciones++
    const info = await page.evaluate(() => {
      const e = document.activeElement
      const s = getComputedStyle(e)
      return { texto: (e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30), indicador: s.outlineStyle !== 'none' || s.boxShadow !== 'none' }
    })
    if (!info.indicador) sinIndicador.push(info.texto)
    if (/Reservar Mesa/.test(info.texto)) { alcanzado = true; break }
  }
  u.nota(`Con teclado se llega a "Reservar Mesa" en ${pulsaciones} pulsaciones de Tab`)
  u.nota(`Elementos enfocados sin indicador de foco visible: ${sinIndicador.length ? sinIndicador.join(', ') : 'ninguno'}`)
  if (!alcanzado) return false
  await page.keyboard.press('Enter'); u.clics++
  await page.waitForTimeout(100)
  return page.getByText('Elige fecha y hora').first().isVisible()
}

function luminancia(hex) {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return +((x + 0.05) / (y + 0.05)).toFixed(2) }

;(async () => {
  const browser = await chromium.launch()
  const R = []
  R.push(await tarea(browser, DESKTOP, 'P1 · Cliente que va directo', 'Reservar mesa para 4 personas el 30 oct. a las 20:00 (agotado) usando una alternativa', flujoClienteDirecto))
  R.push(await tarea(browser, MOVIL, 'P2 · Cliente en móvil', 'Misma reserva desde un teléfono de 390 px', flujoClienteDirecto))
  R.push(await tarea(browser, DESKTOP, 'P3 · Cliente que comete errores', 'Reservar con un grupo de 8, datos mal escritos, corregir desde el resumen y salir con Atrás', flujoClienteErrores))
  R.push(await tarea(browser, DESKTOP, 'P4 · Administrador, alta con conflicto', 'Registrar una reserva en M04 a las 20:00 (ocupada) y resolver el conflicto', adminNuevaReserva))
  R.push(await tarea(browser, DESKTOP, 'P5 · Administrador, cancelar', 'Cancelar la reserva de Ana López', adminEditarCancelar))
  R.push(await tarea(browser, DESKTOP, 'P6 · Administrador, editar con conflicto', 'Mover la reserva SM-3042 a una hora ocupada y luego a una libre', adminEditarConflicto))
  R.push(await tarea(browser, DESKTOP, 'P7 · Cambio de vista', 'Pasar de la vista de cliente a la de administración y volver, solo con la interfaz', navegacionCruzada))
  R.push(await tarea(browser, MOVIL, 'P8 · Administrador en móvil', 'Recorrer las cuatro pantallas de administración en 390 px', (u, p) => auditoriaAdmin(u, p, 'móvil')))
  R.push(await tarea(browser, DESKTOP, 'P10 · Coherencia cliente-administración', 'Reservar como cliente y comprobar que el administrador la ve de inmediato', coherenciaEntreVistas))
  R.push(await tarea(browser, DESKTOP, 'P9 · Usuario de teclado', 'Llegar a "Reservar Mesa" y activarlo solo con Tab y Enter', teclado))
  const pares = {
    'Texto secundario sobre fondo crema (#6a6e62 / #f3f0e8)': contraste('#6a6e62', '#f3f0e8'),
    'Texto secundario sobre tarjeta (#6a6e62 / #fffefa)': contraste('#6a6e62', '#fffefa'),
    'Botón deshabilitado (#7a7f72 / #e1e3db)': contraste('#7a7f72', '#e1e3db'),
    'Error rojo sobre fondo de aviso (#a54c37 / #f8ece5)': contraste('#a54c37', '#f8ece5'),
    'Verde sobre fondo de aviso (#394c32 / #eaf0e3)': contraste('#394c32', '#eaf0e3'),
    'Texto blanco sobre botón verde (#ffffff / #394c32)': contraste('#ffffff', '#394c32'),
  }
  fs.writeFileSync(`ronda-${ronda}.json`, JSON.stringify({ ronda, resultados: R, contraste: pares }, null, 2))
  for (const r of R) {
    console.log(`\n${r.perfil} [${r.viewport}] completada=${r.completada} clics=${r.clics} escritos=${r.camposEscritos} pantallas=${r.pantallas} consola=${r.errorConsola}${r.fallo ? ' FALLO: ' + r.fallo : ''}`)
    r.notas.forEach((n) => console.log('   · ' + n))
    const desb = r.auditorias.filter((a) => a.desborde).map((a) => a.pantalla)
    if (r.auditorias.length) {
      const peq = r.auditorias.reduce((s, a) => s + a.menorQue44, 0)
      const tot = r.auditorias.reduce((s, a) => s + a.interactivos, 0)
      const sinEt = r.auditorias.reduce((s, a) => s + a.sinEtiqueta, 0)
      const h1 = r.auditorias.filter((a) => a.h1 !== 1).map((a) => a.pantalla)
      console.log(`   · auditoría: desborde horizontal en [${desb.join(', ') || 'ninguna'}]; objetivos <44px ${peq}/${tot}; campos sin etiqueta ${sinEt}; pantallas sin un único h1 [${h1.join(', ') || 'ninguna'}]`)
      const clases = {}
      r.auditorias.forEach((a) => Object.entries(a.clasesPequenas).forEach(([k, v]) => { clases[k] = Math.max(clases[k] || 0, v) }))
      console.log('   · elementos pequeños (máx. por pantalla): ' + JSON.stringify(clases))
    }
  }
  console.log('\nContraste:', pares)
  await browser.close()
})()
