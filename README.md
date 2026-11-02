# La Sobremesa · Aplicación web de reservas

Aplicación en **React** para gestionar reservas de mesa en un restaurante. Replica el prototipo de Figma "Sobremesa" (pantallas de **administración A01–A04** y de **cliente C01–C07**, en móvil, tablet y escritorio) y evita duplicaciones de mesa en tiempo real.

Proyecto de la evaluación parcial de *Desarrollo de Interfaces 2* (IDAT).

- Prototipo en Figma: https://www.figma.com/design/R2WWWpLcZddBeOmvRlIu25/Sobremesa
- Integrantes: _(completar con los tres nombres del equipo)_

## Requisitos

- Node.js 18 o superior (probado con 22) y npm.

## Instalar, ejecutar y probar

```bash
npm install        # instala las dependencias
npm run dev        # servidor de desarrollo en http://localhost:5173
npm test           # 17 pruebas unitarias de la lógica de reservas (Vitest)
npm run build      # genera la versión de producción en /dist
npm run preview    # sirve /dist en http://localhost:4173
```

### Rutas (enrutado por hash, sin dependencias)

| Ruta | Pantalla |
| --- | --- |
| `#/` | Cliente · C01 (inicio de la reserva) |
| `#/reservar/fecha`, `/alternativas`, `/personas`, `/datos`, `/resumen`, `/listo` | Cliente · C02 → C07. Cada paso tiene su URL, así que el botón Atrás del navegador retrocede de paso |
| `#/admin` | A01 · Panel principal |
| `#/admin/reservas` | A02 · Calendario y reservas |
| `#/admin/nueva` | A03 · Nueva reserva manual |
| `#/admin/editar/SM-3042` | A04 · Modificar o cancelar |

### Cómo probar el flujo principal

1. **Cliente** (`#/`; desde el pie hay un enlace a administración, y desde administración otro a la vista cliente): pulsa *Reservar Mesa*. El 30 oct. a las 20:00 no hay cupo → *Ver horarios alternativos* → elige las 20:30 → 4 personas → datos → *Revisar reserva* → *Confirmar Reserva*. Recibes un código y puedes guardar el evento (`.ics`) o compartirlo.
2. **Administración** (`#/admin`): la reserva nueva aparece en el panel, la agenda y los indicadores.
3. **Conflicto**: en `#/admin/nueva`, M04 a las 20:00 está ocupada. Guardar queda bloqueado y se ofrece una alternativa que se aplica con un clic.
4. **Editar / cancelar**: en `#/admin/editar` elige la reserva en "Reserva a editar", modifícala (no se cuenta dos veces a sí misma) o cancélala con confirmación.
5. **Grupos grandes**: con 5 a 8 personas el sistema une dos mesas contiguas (por ejemplo M06 + M07).

Los datos se guardan en `localStorage`. El enlace *Restablecer datos de demo* del menú lateral vuelve al estado inicial.

## Estructura

```
src/
├── components/
│   ├── ui/            Componentes base (los de Figma): Boton, Chip, EtiquetaEstado, Aviso,
│   │                  Campo, SelectorNumerico, Indicador, Stepper, ImagenRestaurante,
│   │                  Tarjeta, AccionEdicion, Icono
│   ├── layout/        EncabezadoAdministracion, EncabezadoCliente, NavegacionLateral,
│   │                  NavegacionCompacta, PiePagina, LayoutAdmin, LayoutCliente
│   └── reservas/      Calendario, Agenda, TablaReservas, FranjaHoraria,
│                      ResumenReserva, InfoRestaurante
├── pages/
│   ├── admin/         PanelPrincipal, ConsultarReservas, NuevaReserva, EditarCancelar
│   └── cliente/       FlujoReserva (C01–C07)
├── hooks/             useReservas (contexto + estado), useRuta, useDisponibilidadReserva
├── utils/             disponibilidad.js (conflictos, cupos, alternativas), agenda.js, fechas.js
├── data/seed.js       Mesas, franjas, reservas de demo
└── styles/            tokens.css (paleta y tipografías de Figma) + CSS por capas
```

### Correspondencia con los componentes de Figma

| Componente en Figma | Componente React |
| --- | --- |
| Encabezado administración / cliente | `EncabezadoAdministracion`, `EncabezadoCliente` |
| Botón/Primario · Secundario · Deshabilitado | `Boton` (`variante`, `disabled`) |
| Chip | `Chip`, `FranjaHoraria`, `EtiquetaEstado` |
| Aviso | `Aviso` (`exito`, `error`, `info`, `neutro`) |
| Campo | `Campo` (texto, número, select, textarea, error, ayuda) |
| Calendario expandido | `Calendario` |
| Indicador | `Indicador` |
| Stepper | `Stepper` |
| Selector numérico | `SelectorNumerico` |
| Navegación lateral / compacta | `NavegacionLateral`, `NavegacionCompacta` |
| Imagen esquemática | `ImagenRestaurante` |
| Acción de edición | `AccionEdicion` |

## Hooks de React

- **`useState`**: estado de las reservas (`useReservas`), del formulario, del paso del cliente, del mes visible del calendario, filtros y vista Día/Semana.
- **`useEffect`**:
  - guarda las reservas en `localStorage` en cada cambio;
  - el `Calendario` salta al mes de la fecha elegida desde otro control;
  - `useRuta` escucha `hashchange`;
  - actualiza `document.title` y vuelve arriba en cada paso del flujo.
- **`useMemo` / `useCallback` / `useContext`**: la validación de conflictos (`useDisponibilidadReserva`) se recalcula al cambiar fecha, hora, personas o mesa. El contexto reparte las reservas a todas las pantallas y por eso el panel del administrador refleja al instante lo que reserva un cliente.

## Reglas de negocio

- Una mesa no puede asignarse dos veces a la misma fecha y hora, ni superar su capacidad.
- Los grupos de 5 a 8 personas usan un par de mesas contiguas (M04+M05, M06+M07, M08+M09, M10+M11).
- Al editar, la reserva no se cuenta dos veces a sí misma.
- Las reservas canceladas liberan la mesa y no se pueden cancelar de nuevo.
- Si la franja está agotada, el cliente ve alternativas; al confirmar se vuelve a validar la disponibilidad.
- Teléfono con prefijo y 9 cifras, y correo con formato válido.

## Diseño responsive y accesibilidad

- Escritorio y tablet usan menú lateral. En móvil se usa la navegación compacta y la tabla de reservas pasa a tarjetas.
- Etiquetas asociadas a cada campo, `aria-live` en avisos y contadores, `aria-pressed` en chips y franjas, y foco visible.

## Pruebas de usabilidad

La carpeta `pruebas/` contiene el guion de las pruebas con usuarios simulados (10 perfiles, escritorio y móvil) y los resultados de las dos rondas (`ronda-1.json` antes de las mejoras y `ronda-2.json` después). Son pruebas automatizadas, no con personas reales.

```bash
npm install -D playwright   # una sola vez
npx playwright install chromium
npm run build && npm run preview        # en otra terminal, deja el servidor en :4173
node pruebas/usabilidad.js 3            # genera ronda-3.json
```

## Notas

- La fotografía del restaurante no se pudo extraer de Figma. Copia `restaurante.jpg` en `public/img/` (ver `LEEME.txt`) y se mostrará sola.
- Los valores de las reservas de demo reproducen los indicadores del diseño (25 reservas, 8/12 mesas, 28 personas, 12 plazas libres).
