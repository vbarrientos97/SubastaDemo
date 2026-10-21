# Refactorización y verificaciones

Fecha: 21 de octubre de 2026.

## Cambios

- `BuyerLot` expresa participación, liderazgo y resultado antes de anonimizar. La clasificación de «Mis pujas» consume estos datos explícitos y no reconstruye identidades desde nombres visibles.
- La validación compartida exige oferta actual más incremento mínimo. No impone múltiplos del incremento ni sustituye silenciosamente un monto inválido por otro.
- Las migraciones y los atributos demo quedan en persistencia; las recetas de color quedan en presentación. El contrato `SessionRepository` mantiene `load/save` y los comandos mantienen `Result<T>`.
- La carga valida los campos consumidos y normaliza identificadores repetidos, favoritos y referencias huérfanas, conservando las identidades del historial comercial.
- Las notificaciones validan JSON, separan cuentas y conservan cambios en memoria ante fallos de almacenamiento. La lista global antigua se asigna una sola vez a la primera cuenta que la abre.
- Preferencias, fotos y avisos se suscriben a sus fuentes externas; los hooks mantienen activas las reglas de lint. Se eliminaron estados derivados y temporizadores sin limpieza.
- Las salidas de formularios protegen los borradores y continúan hacia el destino solicitado después de confirmar. El guard de comprador recibe el destino correcto.
- Los diálogos de pizarra comparten gestión de foco, las filas conservan semántica de tabla y los campos muestran foco visible. El contenido reserva el ancho de la barra lateral contraída en escritorio.
- Desarrollo usa `.next-dev`; producción usa `.next`. TypeScript regenera rutas y conserva el chequeo del build.
- Next se actualizó a 16.3.8 y se actualizaron dependencias dentro de sus versiones mayores. Se retiraron `class-variance-authority` y la CLI de shadcn tras comprobar sus consumidores; Base UI se conserva. El CSS especial de shadcn no tenía consumidores y `no-scrollbar` ya estaba definido localmente.

## Verificaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Instalación congelada | Correcta con pnpm 12.3.4 en una carpeta temporal nueva, usando el manifiesto y lockfile finales. |
| Lint | Sin errores ni advertencias. No se desactivaron globalmente reglas de hooks. |
| TypeScript | Correcto mediante `next typegen` y `tsc --noEmit --incremental false`. |
| Pruebas | 39 aprobadas: permisos, montos, proyecciones, favoritos, notificaciones, preferencias, rutas y persistencia. |
| Build de producción | Correcto con Webpack y comprobación de tipos activa. Requiere acceso a las fuentes de Google. |
| Peers | Sin incompatibilidades detectadas. |
| Auditoría de producción | Cero alertas. CI ejecuta `pnpm audit:prod`. |
| Auditoría completa | Una alerta alta de desarrollo en `braces`, sin versión parcheada publicada en el aviso consultado. |

La instalación de la carpeta de trabajo y las comprobaciones se ejecutaron con pnpm 11.25.0, disponible en este entorno. Se verificó por separado que pnpm 12.3.4 instala el mismo lockfile congelado en limpio. El primer intento de reemplazar módulos existentes con pnpm 12 encontró un bloqueo de archivos de Windows; se recuperó la instalación sin detener procesos del usuario.

## Comprobaciones de navegador

Se utilizó la versión de producción local en un puerto independiente y cuentas ficticias:

- Carlos ve dos pujas activas y un lote ganado, con estados «Vas perdiendo», «Vas ganando» y «Ganado».
- Un monto de 2449 se rechaza cuando la oferta es 2400 y el incremento es 50.
- Cancelar la salida conserva el borrador; confirmar descarta el texto sin guardarlo. El enlace lateral a Reportes continúa hacia Reportes después de confirmar.
- El diálogo de lote contiene el foco con Tab/Shift+Tab. Escape lo cierra y devuelve el foco al botón que lo abrió.
- La proyección ampliada contiene el foco y devuelve el foco a «Ampliar» al cerrarse.
- Acceder a Notificaciones sin sesión lleva a `/entrar?next=%2Fnotificaciones`.
- Con la barra lateral contraída, el encabezado de «Mis pujas» comienza a 96 px, fuera de los 72 px ocupados por la navegación.
- Se inspeccionaron los flujos en la vista compacta y en escritorio a 1280 px. Esto no constituye una certificación completa de contraste ni pruebas con lectores de pantalla.

## Límites y seguimiento

- La política de apertura, cierre y adjudicación de lotes sigue pendiente de definición. Los lotes nuevos permanecen `upcoming`; el contador es ilustrativo.
- Autenticación, autorización y anonimización se simulan en el navegador. Se requiere autoridad del servidor para datos reales.
- El almacenamiento local no ofrece transacciones entre pestañas o dispositivos.
- La alerta restante llega por `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`, dentro de herramientas de desarrollo. No se silenció ni se forzó un salto de versión incompatible. Revisar [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) cuando exista corrección.
- ESLint 9.39.5 está deprecado, pero los plugins de React/importación/accesibilidad de esta configuración todavía declaran compatibilidad con ESLint 9. Se comprobó la incompatibilidad de peers con ESLint 10 y se conserva la versión compatible hasta actualizar conjuntamente esa cadena.
- El override de `brace-expansion@5.0.6` a `5.0.12` aplica un parche dentro del rango admitido por minimatch. Retirarlo cuando la resolución de upstream ya seleccione una versión segura.

Las pruebas de Node emiten avisos sobre type stripping y módulos sin `type`; no son fallos de las pruebas.
