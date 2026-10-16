# SubastaDemo

Demo de subastas ganaderas con Next.js App Router, React y TypeScript. Los datos, usuarios y permisos se simulan en el navegador; no se deben ingresar credenciales reales.

## Desarrollo

Usar Node.js 22.6 o posterior con soporte de `--experimental-strip-types`, y pnpm 12.3.4.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir http://localhost:3000. Cuentas demo: `admin` / `admin`, `carlos` / `carlos` y `omar` / `omar`.

## Verificación

```sh
pnpm typecheck
pnpm test
pnpm check
pnpm build
```

Las pruebas cubren permisos simulados, pujas, favoritos por cuenta, fechas, eliminaciones y migraciones del almacenamiento. El build usa Webpack y exige tipos válidos. Turbopack está disponible con `pnpm build:turbo`; en el entorno Windows de desarrollo falló al iniciar el proceso de CSS. Las fuentes de Google pueden requerir conexión durante la construcción. GitHub Actions ejecuta tipos, pruebas y build en pushes y pull requests.

## Organización

- `app/`: rutas y layouts.
- `components/`: interfaz por área funcional.
- `lib/domain/`: entidades, validaciones y cálculos puros.
- `lib/application/`: casos de uso y contrato de repositorio.
- `lib/session/`: almacenamiento local, validación y migraciones históricas.
- `lib/data/`: catálogo inicial simulado.
- `hooks/`: comportamiento compartido de React.

Los casos de uso reciben un `SessionRepository`. El proveedor de sesión conecta ese contrato con React. Para integrar una API, adaptar los comandos a operaciones asíncronas y aplicar autorización y validación en el servidor; los guards del navegador solo simulan permisos.

## Datos y restablecimiento

El estado se guarda en `localStorage` bajo `subasta.session`. Las lecturas normales conservan las eliminaciones y ediciones; las migraciones antiguas se ejecutan una sola vez según la versión. Los favoritos pertenecen a cada cuenta. Al migrar la lista global antigua se asigna únicamente a la cuenta que estaba conectada.

Para restablecer la demo, eliminar únicamente `subasta.session` en las herramientas de almacenamiento del navegador y recargar. Esto elimina las modificaciones locales del escenario. Si el navegador bloquea el almacenamiento o se agota la cuota, la sesión continúa en memoria y los cambios duran hasta recargar.

Las pestañas del mismo origen comparten la sesión y se actualizan mediante el evento `storage`; cambiar de cuenta en una también cambia la sesión de las demás. No se simula concurrencia de pujas entre dispositivos.

Los clientes con historial de pujas o adjudicaciones se conservan; pueden desasociarse de una subasta sin borrar su historial comercial.
