# Guia MVP Frontend - Turnero Chubut

## Objetivo

Dejar listo el frontend del turnero para una demo funcional con cliente, enfocada en el flujo real del taller:

1. El cajero carga un vehiculo y el servicio solicitado.
2. El vehiculo aparece en la fila de espera.
3. El cajero o encargado arrastra el vehiculo a un box.
4. El sistema pide asignar uno o mas operarios.
5. La pantalla del taller muestra claramente que vehiculo debe ingresar, en que box, con que servicio y que operario lo atiende.
6. El trabajo puede finalizarse y pasar a historial/finalizados.

El alcance de esta guia es solo frontend. El backend Java se incorporara despues, pero el frontend debe quedar preparado para conectarse a una API real sin rehacer la aplicacion.

## Estado Actual

La app ya tiene una base correcta:

- Angular standalone + Ionic.
- Dashboard principal en `src/app/features/dashboard/pages/dashboard`.
- Pantalla operativa de taller en `src/app/features/workshop/pages/workshop`.
- Componentes reutilizables para cards de vehiculos, boxes y listas.
- Drag and drop con Angular CDK.
- Estado compartido temporal usando `BroadcastChannel`.
- Editor de servicio con Quill y un intento de autocomplete por slash.

La idea funcional esta bien encaminada. Lo que falta para MVP es robustecer el flujo, corregir bugs de estado, mejorar la experiencia de carga y adaptar la UI a pantallas reales de uso.

## Prioridades del MVP

### P0 - Debe estar antes de mostrar al cliente

- Corregir bugs que pueden perder vehiculos o mostrar estado incorrecto.
- Lograr que `build`, `test` y `lint` pasen o dejar reglas ajustadas intencionalmente.
- Asegurar que dashboard y pantalla taller se sincronicen de forma confiable durante la demo.
- Arreglar el dropdown/autocomplete del servicio.
- Hacer responsive para notebook, monitor chico, tablet y celular.
- Pulir textos, encoding, estados vacios y acciones principales.

### P1 - Muy recomendable para una demo solida

- Agregar persistencia local temporal para que un refresh no borre todo.
- Separar estado y logica en servicios typed.
- Crear datos demo resetables.
- Mejorar accesibilidad basica de botones, inputs y modales.
- Agregar feedback visual durante drag/drop.

### P2 - Puede esperar al backend

- Autenticacion y roles reales.
- Persistencia definitiva.
- Auditoria, historial completo y reportes.
- Catalogos administrables.
- WebSockets/SSE reales.
- Manejo de sucursales, usuarios y permisos.

## Plan de Trabajo

## Fase 1 - Estabilizar base tecnica

### 1.1 Corregir tests generados

Archivos involucrados:

- `src/app/core/services/workshop-state.spec.ts`
- `src/app/features/dashboard/components/*/*.spec.ts`
- `src/app/features/workshop/components/*/*.spec.ts`

Tareas:

- Cambiar import incorrecto `WorkshopState` por `WorkshopStateService`.
- En specs de componentes standalone, usar `imports: [Componente]` en lugar de `declarations`.
- Proveer datos minimos requeridos para inputs obligatorios, por ejemplo `vehicle`, `bay` o `box`.
- Agregar tests simples del flujo critico:
  - crear vehiculo lo agrega a espera;
  - asignar vehiculo a box lo quita de espera;
  - finalizar vehiculo lo mueve a finalizados;
  - devolver vehiculo desde box lo regresa a espera.

Criterio de listo:

- `ng test --watch=false --browsers=ChromeHeadless` pasa.

### 1.2 Resolver lint o ajustar reglas

Archivos involucrados:

- `src/app/core/services/workshop-state.ts`
- `src/app/features/dashboard/pages/dashboard/dashboard.page.ts`
- `src/app/features/workshop/pages/workshop/workshop.page.ts`

Tareas:

- Migrar inyeccion por constructor a `inject()` si se mantiene la regla `@angular-eslint/prefer-inject`.
- O decidir equipo mediante `.eslintrc.json` si se prefiere constructor injection por claridad.
- Tipar eventos CDK y modelos para reducir `any`.

Criterio de listo:

- `ng lint` pasa.

### 1.3 Corregir build productivo

Problema actual:

- `ng build` falla porque intenta descargar Google Fonts para inlinear `Inter`.

Opciones:

- Autohostear la fuente en `src/assets/fonts`.
- Usar stack del sistema: `font-family: Inter, Arial, sans-serif`.
- Desactivar font inlining si el equipo lo prefiere para la etapa MVP.

Criterio de listo:

- `ng build` pasa sin depender de red externa.

## Fase 2 - Estado y flujo operativo

### 2.1 Tipar el dominio minimo

Crear o ajustar modelos:

- `Vehicle`
- `Bay`
- `Operator`
- `ServiceItem`
- `VehicleStatus`

Campos sugeridos para `Vehicle`:

```ts
export interface Vehicle {
  id: number;
  ticketNumber: number;
  patent: string;
  description: string;
  service: string;
  status: 'WAITING' | 'IN_BAY' | 'COMPLETED';
  assignedOperators: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

Nota:

- Usar `string` ISO para fechas facilita persistencia, serializacion y futuro backend.

### 2.2 Corregir bug de drag hacia box ocupado

Problema:

- Al mover un vehiculo desde un box hacia otro box ocupado, se limpia primero el box anterior y luego se cancela por destino ocupado. El vehiculo puede perderse.

Solucion:

- Validar primero si el box destino esta ocupado.
- Si esta ocupado, cancelar la operacion y mantener estado anterior.
- Solo limpiar el origen cuando el destino sea valido.
- Considerar una regla clara:
  - MVP recomendado: un box ocupado no acepta drops.
  - Alternativa futura: intercambio de vehiculos entre boxes.

Criterio de listo:

- Nunca desaparece un vehiculo por un drag invalido.

### 2.3 Sincronizacion entre dashboard y pantalla taller

Problema actual:

- `BroadcastChannel` solo comunica eventos nuevos. Si `/workshop` se abre despues de la asignacion o se refresca, puede mostrar boxes vacios.

Solucion MVP:

- Mantener `BroadcastChannel` para sincronizacion entre pestanias.
- Agregar persistencia local en `localStorage`.
- Al iniciar `WorkshopStateService`, leer estado guardado si existe.
- Cada `updateBays` debe actualizar `BehaviorSubject`, `localStorage` y `BroadcastChannel`.
- Agregar una accion de "Reset demo" para volver a datos iniciales.

Solucion futura con backend:

- Reemplazar `localStorage` por API REST.
- Reemplazar `BroadcastChannel` por WebSocket o Server-Sent Events.

Criterio de listo:

- Si se abre `/workshop` despues de asignar autos, muestra el estado actual.
- Si se refresca dashboard o workshop durante demo, no se pierde el estado.

### 2.4 Unificar fuente de verdad

Problema:

- `waitingVehicles`, `completedVehicles` y `bays` viven principalmente dentro de `DashboardPage`.
- Esto dificulta compartir estado y preparar backend.

Solucion recomendada:

- Crear un servicio `TurnStateService` o ampliar `WorkshopStateService` para manejar:
  - `waitingVehicles$`
  - `completedVehicles$`
  - `bays$`
  - acciones: `createVehicle`, `assignVehicleToBay`, `returnVehicleToWaiting`, `completeVehicle`, `restoreCompletedVehicle`.

Criterio de listo:

- Las paginas consumen observables/señales del servicio.
- La logica de negocio no queda repartida en templates o componentes visuales.

## Fase 3 - Dropdown del input de servicio

## Objetivo UX

El cajero debe cargar servicios rapido, sin memorizar codigos, con teclado y mouse. El dropdown tiene que sentirse confiable, no tapar contenido y no quedar flotando fuera de lugar.

## Comportamiento esperado

### Entrada

- El usuario escribe en el editor de servicio.
- Si escribe `/`, aparece el dropdown.
- Si escribe `/ali`, filtra por codigo o nombre y muestra "Alineacion auto".
- Tambien deberia funcionar buscando texto normal si se decide quitar el slash.

### Navegacion

- Flecha abajo: siguiente opcion.
- Flecha arriba: opcion anterior.
- Enter: insertar opcion seleccionada.
- Escape: cerrar dropdown.
- Click en opcion: insertar opcion.
- Click fuera: cerrar dropdown.

### Insercion

- Reemplazar solamente la palabra activa iniciada con `/`.
- Insertar el nombre del servicio, no el codigo, salvo que el diseño final pida ambos.
- Mantener el cursor despues del texto insertado.
- No duplicar espacios.

### Posicionamiento

- El dropdown debe posicionarse debajo del cursor o, si eso falla, debajo del editor.
- Debe quedar dentro del modal.
- Debe soportar scroll del modal.
- Debe tener `z-index` consistente con el modal.

### Estados

- Sin resultados: mostrar "Sin resultados".
- Cargando: reservado para backend futuro.
- Servicio seleccionado: se debe poder editar como texto normal.

## Implementacion recomendada

Opcion A - Mantener Quill y dropdown custom:

- Usar `quill.getSelection()` y `quill.getBounds(index)` para posicionar.
- Guardar `activeTokenStart` y `activeTokenText` en lugar de usar `lastIndexOf`.
- Calcular token activo desde el cursor, no desde todo el texto.
- Manejar `Escape` en `keyboard.addBinding`.
- Cerrar dropdown en blur/click outside.

Opcion B - Simplificar para MVP:

- Reemplazar Quill por un `textarea` o `ion-textarea` con autocomplete externo.
- Mantener servicios como texto plano.
- Es mas simple, mas estable y suficiente para una demo de taller.

Recomendacion:

- Para MVP, si no se necesita rich text real, usar `textarea`.
- Si se quiere conservar formato por futuro, mantener Quill pero aislarlo en un componente `ServiceInputComponent`.

Componente sugerido:

- `src/app/features/dashboard/components/service-input/service-input.component.ts`

Inputs/outputs:

- `@Input() services: ServiceItem[]`
- `@Input() value = ''`
- `@Output() valueChange = new EventEmitter<string>()`
- `@Output() serviceSelected = new EventEmitter<ServiceItem>()`

Criterio de listo:

- El dropdown funciona con teclado y mouse.
- No se desposiciona dentro del modal.
- No rompe si no hay resultados.
- Esta cubierto por tests unitarios basicos.

## Fase 4 - UX/UI para demo

## Principios de diseno

La app es una herramienta operativa, no una landing. Debe sentirse:

- Rapida.
- Clara.
- Robusta.
- Visible a distancia.
- Facil para gente que esta trabajando con clientes y autos entrando/saliendo.

Evitar:

- Decoracion innecesaria.
- Textos largos explicativos dentro de la app.
- Cards anidadas.
- Botones con texto chico en pantallas de taller.
- Acciones destructivas sin confirmacion o forma de revertir.

## Dashboard cajero/encargado

### Mejoras principales

- Header mas compacto para ganar espacio operativo.
- Sidebar colapsable o superior en pantallas chicas.
- Boton principal "Nuevo vehiculo" siempre visible.
- Fila de espera mas protagonista.
- Boxes con estados claros:
  - libre;
  - ocupado;
  - drop activo;
  - drop invalido.
- Finalizados menos dominante que espera.

### Modal nuevo vehiculo

Campos MVP:

- Patente.
- Descripcion del vehiculo.
- Servicio.
- Observaciones opcionales.

Validaciones:

- Patente obligatoria.
- Servicio obligatorio.
- Normalizar patente a mayusculas.
- Evitar crear vehiculo si faltan datos.

Acciones:

- Crear.
- Cancelar.
- Limpiar formulario despues de crear.
- Cerrar con Escape.

### Modal asignar operario

Mejoras:

- Mostrar patente y servicio del vehiculo que se esta asignando.
- Permitir seleccionar uno o mas operarios.
- Validar que haya al menos un operario seleccionado.
- Boton confirmar deshabilitado hasta cumplir validacion.
- Boton cancelar no debe modificar estado.

### Cards de vehiculo

Debe mostrar:

- Numero de turno.
- Patente.
- Descripcion.
- Servicio.
- Tiempo de espera.
- Operarios asignados si existen.

Mejoras:

- Truncar servicio largo con tooltip o expansion.
- Usar colores por estado.
- Hacer toda la card draggable, pero con cursor y feedback visual claros.

## Pantalla taller

Objetivo:

- Que un operario pueda mirar desde lejos y entender que entra, donde y que debe hacer.

Debe mostrar por box:

- Nombre del box.
- Estado: libre u ocupado.
- Patente muy grande.
- Descripcion del vehiculo.
- Servicio en grande.
- Operarios asignados.
- Tiempo desde que ingreso al box o tiempo de espera total, definir criterio.

Mejoras:

- Si no hay vehiculo, box verde con "LIBRE".
- Si hay vehiculo, box rojo/ambar con informacion grande.
- Evitar informacion vacia como `brand`/`model` si el modelo no la tiene.
- Ajustar para televisores o monitores chicos.

## Fase 5 - Responsive

## Breakpoints sugeridos

- Celular: hasta 599px.
- Tablet: 600px a 1023px.
- Notebook/monitor chico: 1024px a 1365px.
- Desktop grande: 1366px o mas.

## Dashboard

### Desktop grande

- Sidebar fija.
- 3 boxes en fila.
- Listas en dos columnas.

### Monitor chico / notebook

- Sidebar mas angosta o header superior.
- 2 o 3 boxes segun ancho.
- Cards con ancho flexible.
- Evitar que el header robe demasiado alto.

### Tablet

- Layout en una columna o dos columnas.
- Boxes en grilla 2 columnas.
- Listas apiladas.
- Drag/drop debe seguir usable con touch.

### Celular

- No depender solo de drag/drop.
- Agregar acciones alternativas:
  - boton "Asignar a box" dentro de card;
  - selector de box;
  - selector de operario.
- Sidebar reemplazada por topbar o menu.
- Cards full width.

## Pantalla taller

### Desktop/TV

- 3 boxes en fila si entran bien.
- Texto grande y alto estable.

### Monitor chico

- 2 boxes arriba y 1 abajo, o grilla adaptable.
- Evitar overflow vertical.

### Tablet/celular

- Boxes apilados.
- Cada box debe ocupar altura razonable, no 80vh fijo.

Cambios CSS esperados:

- Reemplazar alturas fijas como `height: 80vh` por `min-height`, `aspect-ratio` o reglas por breakpoint.
- Usar `grid-template-columns: repeat(auto-fit, minmax(...))`.
- Definir anchos estables para cards.
- Evitar border radius excesivo en controles compactos.

## Fase 6 - Preparacion para backend Java

Aunque el backend no se implemente ahora, el frontend debe quedar listo para conectarse.

## API futura sugerida

Entidades:

- `VehicleTurn`
- `Bay`
- `Operator`
- `ServiceCatalogItem`

Endpoints futuros:

- `GET /api/turns?status=WAITING`
- `POST /api/turns`
- `PATCH /api/turns/{id}/assign`
- `PATCH /api/turns/{id}/complete`
- `PATCH /api/turns/{id}/return-to-waiting`
- `GET /api/bays`
- `GET /api/operators`
- `GET /api/services`

Tiempo real:

- WebSocket o SSE para eventos:
  - `TURN_CREATED`
  - `TURN_ASSIGNED`
  - `TURN_COMPLETED`
  - `BAY_UPDATED`

Preparacion frontend:

- Encapsular estado en servicios.
- Crear interfaces que coincidan con DTOs futuros.
- Evitar que componentes visuales conozcan detalles de persistencia.
- Centralizar acciones de negocio.

## Fase 7 - Checklist de demo

## Escenario demo principal

1. Abrir dashboard.
2. Abrir pantalla taller en otra pestaña/monitor.
3. Crear vehiculo con patente, descripcion y servicio.
4. Verlo en fila de espera.
5. Arrastrarlo a BOX 1.
6. Asignar operario.
7. Confirmar que aparece en pantalla taller.
8. Crear segundo vehiculo.
9. Intentar mover a box ocupado y verificar que no se pierde.
10. Finalizar vehiculo de BOX 1.
11. Confirmar que pasa a finalizados.
12. Refrescar pantalla taller y confirmar que el estado se mantiene.

## Checklist tecnico antes de presentar

- `ng build` pasa.
- `ng build --configuration development` pasa.
- `ng test --watch=false --browsers=ChromeHeadless` pasa.
- `ng lint` pasa.
- No hay textos con encoding roto.
- No hay campos vacios por mismatch de modelo.
- No hay `any` en flujo principal salvo excepciones justificadas.
- La app funciona sin internet externo.
- La demo tiene datos iniciales o boton de reset.

## Checklist UX antes de presentar

- Se entiende que boton usar para crear turno.
- Se entiende que vehiculos se arrastran a boxes.
- Hay alternativa al drag/drop en celular.
- Los modales validan antes de confirmar.
- Los mensajes vacios son claros.
- El servicio se carga rapido desde dropdown.
- La pantalla taller se lee desde distancia.
- Responsive probado en:
  - 390px celular;
  - 768px tablet;
  - 1024px notebook;
  - 1366px desktop;
  - monitor ancho si el cliente lo usa.

## Orden recomendado de ejecucion

1. Arreglar tests, lint y build.
2. Corregir bug de drag/drop con box ocupado.
3. Persistir estado local y sincronizar dashboard/workshop.
4. Tipar dominio y limpiar `any` principales.
5. Arreglar pantalla taller para usar campos reales.
6. Extraer y estabilizar input/dropdown de servicio.
7. Mejorar modales y validaciones.
8. Responsive dashboard.
9. Responsive pantalla taller.
10. Pulido visual y textos.
11. Crear modo demo/reset.
12. Ejecutar checklist completa con build, tests y recorrido manual.

## Definicion de MVP listo

El frontend esta listo para presentar cuando:

- El flujo caja a taller se puede completar sin errores visibles.
- No se pierde estado por acciones normales de usuario.
- La pantalla taller refleja el dashboard de forma consistente.
- La carga de servicios es comoda y confiable.
- Se puede usar en monitor chico, tablet y celular.
- La app compila y los tests minimos pasan.
- La UI transmite claridad y confianza para que el cliente pueda aprobar la direccion del producto.

