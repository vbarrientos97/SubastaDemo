# SubastaDemo

Demo de subastas ganaderas con Next.js App Router, React y TypeScript. Los datos, usuarios y permisos se simulan en el navegador; no se deben ingresar credenciales reales.

## Desarrollo

Usar Node.js 22.13 o posterior (Node.js 24 recomendado), y pnpm 12.3.4.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir http://localhost:3000. Cuentas demo: `admin` / `admin`, `carlos` / `carlos` y `omar` / `omar`.

## Verificación

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm build
pnpm audit:prod
```

Las pruebas cubren permisos simulados, incremento mínimo, proyecciones anónimas del comprador, favoritos por cuenta, notificaciones, preferencias, fechas, eliminaciones y migraciones del almacenamiento. `pnpm check` ejecuta lint, tipos y pruebas. El chequeo de tipos regenera las rutas con `next typegen`; no se editan archivos generados manualmente. Desarrollo escribe en `.next-dev/` y producción en `.next/` para evitar interferencias. `.next/dev/` se excluye por ser la antigua salida de desarrollo; los tipos actuales de desarrollo y producción sí se comprueban.

El build usa Webpack y exige tipos válidos. Turbopack está disponible con `pnpm build:turbo`; en el entorno Windows de desarrollo falló al iniciar el proceso de CSS. Las fuentes de Google requieren conexión durante la construcción. GitHub Actions ejecuta instalación congelada, lint, tipos, pruebas y build en pushes y pull requests.

ESLint 9 se conserva por compatibilidad con los peers de los plugins incluidos en `eslint-config-next`. No se desactivan globalmente las reglas de hooks. La CLI de shadcn no es una dependencia de la aplicación: sus utilidades CSS importadas no tenían consumidores y `no-scrollbar` ya se define localmente. `components.json` se conserva como configuración para una eventual ejecución manual de la CLI.

## Organización

- `app/`: rutas y layouts.
- `components/`: interfaz por área funcional.
- `lib/domain/`: entidades, validaciones y cálculos puros.
- `lib/application/`: casos de uso y contrato de repositorio.
- `lib/session/`: almacenamiento local, validación y migraciones históricas.
- `lib/notifications/`: almacenamiento por cuenta y eventos de notificaciones demo.
- `lib/demo/`: sincronización simulada; no envía datos a un servidor.
- `lib/data/`: catálogo inicial simulado.
- `hooks/`: comportamiento compartido de React.

Los casos de uso reciben un `SessionRepository`. El proveedor de sesión conecta ese contrato con React. Para integrar una API, adaptar los comandos a operaciones asíncronas y aplicar autorización y validación en el servidor; los guards del navegador solo simulan permisos.

## Datos y restablecimiento

El estado se guarda en `localStorage` bajo `subasta.session`. Las lecturas normales conservan las eliminaciones y ediciones; las migraciones antiguas se ejecutan una sola vez según la versión. Los favoritos pertenecen a cada cuenta. Al migrar la lista global antigua se asigna únicamente a la cuenta que estaba conectada.

Para restablecer la demo, eliminar únicamente `subasta.session` en las herramientas de almacenamiento del navegador y recargar. Esto elimina las modificaciones locales del escenario. Si el navegador bloquea el almacenamiento o se agota la cuota, la sesión continúa en memoria y los cambios duran hasta recargar.

Las pestañas del mismo origen comparten la sesión y se actualizan mediante el evento `storage`; cambiar de cuenta en una también cambia la sesión de las demás. No se simula concurrencia de pujas entre dispositivos.

Los clientes con historial de pujas o adjudicaciones se conservan; pueden desasociarse de una subasta sin borrar su historial comercial.

Las notificaciones utilizan `subasta.notificaciones-demo.v2.<cuenta>`. La lista global anterior se asigna una sola vez a la primera cuenta que la abre. Cada cuenta mantiene sus avisos y lecturas; si el almacenamiento falla, los cambios se conservan en memoria hasta recargar. Los avisos iniciales y la alerta de demostración son escenarios simulados, no sucesos detectados de una puja real. Las preferencias también toleran almacenamiento bloqueado.

La carga valida los campos usados por la interfaz y normaliza identificadores duplicados y referencias huérfanas. No restaura entidades eliminadas ni elimina identidades de pujas históricas de competidores demo.

## Reglas y decisiones pendientes

La puja mínima es `oferta actual + incremento mínimo`; se aceptan enteros seguros superiores aunque no sean múltiplos del incremento. La misma validación se aplica en la interfaz y en el comando. Las proyecciones del comprador calculan participación, liderazgo y resultado antes de eliminar identidades ajenas.

Los lotes nuevos permanecen `upcoming`. La política para abrir, cerrar y adjudicar lotes sigue pendiente de definición; no se deduce del contador visual. El contador es ilustrativo y puede reiniciarse al montar la vista. El cierre temporal de subastas se valida nuevamente al intentar pujar.

Los guards y las proyecciones del navegador simulan permisos y privacidad. Para utilizar datos reales se requiere validación y autorización del servidor, credenciales seguras y control de concurrencia. `storage` sincroniza pestañas, pero no evita que dos escrituras simultáneas se sobrescriban.

Los resultados y las limitaciones de la refactorización se documentan en [Verificaciones](docs/verificacion-refactorizacion.md).
