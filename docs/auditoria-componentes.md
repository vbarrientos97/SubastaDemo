# Auditoría y refactorización de componentes React

Fecha de cierre: 22 de octubre de 2026. Comparación inicial con el `HEAD` anterior a esta refactorización; la segunda revisión se compara con la primera implementación. No se modificaron dominio, comandos, persistencia, dependencias, rutas ni reglas de autorización.

## A. Inventario completo

Se recorrieron los archivos TSX de `app` y `components`, las funciones de componentes privadas y los hooks relacionados. Las líneas cuentan la declaración completa de cada función, incluidos firma, JSX y líneas vacías; no son el tamaño del archivo. Los controles de flujo se cuentan como señales de revisión, no como una métrica formal de complejidad cognitiva. Un guion en «antes» identifica una nueva extracción.

La tabla registra estado local declarado con `useState`, efectos directos, controles de flujo (`if`, ternarios y bucles), consumidores y decisión. El estado encapsulado en hooks se revisó en sus implementaciones y no se vuelve a contar como estado local del consumidor. Los componentes de terceros no forman parte del inventario.

Inventario final: **131 funciones de componentes: 105 originales y 26 extracciones nuevas**, en 70 archivos TSX originales más los archivos de presentación añadidos. La sección H detalla la segunda revisión.

| Componente y ubicación actual | Líneas antes | Líneas después | Estado / efectos y señales iniciales | Consumidores actuales | Resultado |
|---|---:|---:|---|---|---|
| `AdminLayout` · `app/admin/layout.tsx` | 5 | 5 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AdminPage` · `app/admin/page.tsx` | 3 | 3 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AdminAuctionClientsPage` · `app/admin/subastas/[id]/clientes/page.tsx` | 8 | 8 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AdminAuctionEditPage` · `app/admin/subastas/[id]/editar/page.tsx` | 8 | 8 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AuctionWorkspaceLayout` · `app/admin/subastas/[id]/layout.tsx` | 7 | 7 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AdminAuctionLotsPage` · `app/admin/subastas/[id]/lotes/page.tsx` | 8 | 8 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AdminAuctionDashboardPage` · `app/admin/subastas/[id]/page.tsx` | 4 | 4 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AuctionReportsPage` · `app/admin/subastas/[id]/reportes/page.tsx` | 4 | 4 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AdminAuctionsRedirect` · `app/admin/subastas/page.tsx` | 3 | 3 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `BuyerSettings` · `app/ajustes/page.tsx` | 111 | 111 | preview, photoMessage / 0 efectos; 12 controles; 5 handlers JSX | SettingsContent | Conservado: ruta, composición o sección específica de la página. |
| `SettingsContent` · `app/ajustes/page.tsx` | 4 | 4 | — / 0 efectos; 1 controles; 0 handlers JSX | AjustesPage | Conservado: ruta, composición o sección específica de la página. |
| `AjustesPage` · `app/ajustes/page.tsx` | 7 | 7 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `CuentaRedirect` · `app/cuenta/page.tsx` | 3 | 3 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `CustomerPage` · `app/customer/page.tsx` | 3 | 3 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `EntrarPage` · `app/entrar/page.tsx` | 32 | 32 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `FavoritesHeading` · `app/favoritos/favoritos-client.tsx` | 32 | 32 | — / 0 efectos; 0 controles; 1 handlers JSX | FavoritosContent | Conservado: ruta, composición o sección específica de la página. |
| `FavoritosContent` · `app/favoritos/favoritos-client.tsx` | 47 | 47 | — / 0 efectos; 4 controles; 1 handlers JSX | FavoritosClient | Conservado: ruta, composición o sección específica de la página. |
| `FavoritosClient` · `app/favoritos/favoritos-client.tsx` | 7 | 7 | — / 0 efectos; 0 controles; 0 handlers JSX | FavoritosPage | Conservado: ruta, composición o sección específica de la página. |
| `FavoritosPage` · `app/favoritos/page.tsx` | 3 | 3 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `RootLayout` · `app/layout.tsx` | 21 | 21 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `LotDetailPage` · `app/lote/[id]/page.tsx` | 8 | 8 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `NotificationsContent` · `app/notificaciones/page.tsx` | 46 | 46 | — / 0 efectos; 5 controles; 2 handlers JSX | NotificationsPage | Conservado: ruta, composición o sección específica de la página. |
| `NotificationsPage` · `app/notificaciones/page.tsx` | 3 | 3 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `HomePage` · `app/page.tsx` | 65 | 65 | — / 1 efectos; 10 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `PujasContent` · `app/pujas/page.tsx` | 61 | 61 | selectedLotId / 0 efectos; 5 controles; 1 handlers JSX | PujasPage | Conservado: ruta, composición o sección específica de la página. |
| `BidSection` · `app/pujas/page.tsx` | 44 | 44 | — / 0 efectos; 1 controles; 1 handlers JSX | PujasContent | Conservado: ruta, composición o sección específica de la página. |
| `BidLotRow` · `app/pujas/page.tsx` | 91 | 91 | — / 0 efectos; 14 controles; 1 handlers JSX | BidSection | Conservado: ruta, composición o sección específica de la página. |
| `SelectedLotPanel` · `app/pujas/page.tsx` | 53 | 53 | — / 0 efectos; 6 controles; 0 handlers JSX | PujasContent | Conservado: ruta, composición o sección específica de la página. |
| `PujasPage` · `app/pujas/page.tsx` | 7 | 7 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `RegistroPage` · `app/registro/page.tsx` | 11 | 11 | — / 0 efectos; 0 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AuctionCatalogPage` · `app/subasta/[id]/page.tsx` | 65 | 65 | — / 1 efectos; 10 controles; 0 handlers JSX | Next (ruta/layout) | Conservado: ruta, composición o sección específica de la página. |
| `AccountDrawerSection` · `components/account/profile-menu.tsx` | 46 | 46 | — / 0 efectos; 7 controles; 3 handlers JSX | AdminMobileMenu, AdminSidebar, DesktopSidebar, MainMenuDrawer | Conservado: interacción e historial cohesionados; sin controlador genérico. |
| `ThemeToggle` · `components/account/theme-toggle.tsx` | 84 | 84 | — / 0 efectos; 5 controles; 4 handlers JSX | BuyerSettings, AdminSettings | Conservado: presentación o control específico sin estado independiente. |
| `AdminBreadcrumbs` · `components/admin/admin-breadcrumbs.tsx` | 46 | 46 | — / 0 efectos; 6 controles; 0 handlers JSX | AdminShell | Conservado: presentación o control específico sin estado independiente. |
| `AdminSettings` · `components/admin/admin-settings.tsx` | 11 | 11 | — / 0 efectos; 0 controles; 0 handlers JSX | SettingsContent | Conservado: presentación o control específico sin estado independiente. |
| `AdminShell` · `components/admin/admin-shell.tsx` | 17 | 17 | — / 0 efectos; 0 controles; 0 handlers JSX | AdminLayout, AppShell | Conservado: presentación o control específico sin estado independiente. |
| `AdminSidebar` · `components/admin/admin-sidebar.tsx` | 159 | 105 | collapsed, mobileOpen, previousPath / 2 efectos; 18 controles; 9 handlers JSX | AdminShell | Separado: menú móvil con foco propio; navegación y barra de escritorio conservadas. |
| `MobileSidebarLink` · `components/admin/admin-mobile-menu.tsx` | 17 | 17 | — / 0 efectos; 2 controles; 1 handlers JSX | AdminMobileMenu | Conservado: interacción e historial cohesionados; sin controlador genérico. |
| `SidebarLink` · `components/admin/admin-sidebar.tsx` | 18 | 18 | — / 0 efectos; 3 controles; 0 handlers JSX | AdminSidebar | Conservado: interacción e historial cohesionados; sin controlador genérico. |
| `AuctionAdminList` · `components/admin/auction-admin.tsx` | 280 | 127 | suggestAddLots, filtersOpen, filters, confirmCreateLeave, pendingStatusAction, statusActionError / 0 efectos; 18 controles; 20 handlers JSX | AdminPage | Refactorizado: creación, filtros y filas separados; coordinación de acciones única. |
| `AuctionEditor` · `components/admin/auction-editor.tsx` | 208 | 114 | error, pendingDelete, confirmSync, syncing, syncMessage, confirmLeave, pendingStatusAction, statusActionError / 0 efectos; 19 controles; 15 handlers JSX | AdminAuctionEditPage | Separado: sincronización y confirmación de eliminación en AuctionEditorActions. |
| `AuctionFields` · `components/admin/auction-fields.tsx` | 58 | 58 | — / 0 efectos; 0 controles; 5 handlers JSX | AuctionCreateForm, AuctionEditor | Extraído junto a su funcionalidad; comportamiento conservado. |
| `AuctionStatusSummary` · `components/admin/auction-status-controls.tsx` | 22 | 22 | — / 0 efectos; 6 controles; 0 handlers JSX | AuctionEditor | Extraído junto a su funcionalidad; comportamiento conservado. |
| `StatusActionConfirmation` · `components/admin/auction-status-controls.tsx` | 27 | 27 | — / 0 efectos; 1 controles; 2 handlers JSX | AuctionAdminList, AuctionEditor | Extraído junto a su funcionalidad; comportamiento conservado. |
| `AuctionStatusActions` · `components/admin/auction-status-controls.tsx` | 35 | 35 | — / 0 efectos; 2 controles; 1 handlers JSX | AuctionAdminRow, AuctionEditor | Extraído junto a su funcionalidad; comportamiento conservado. |
| `AuctionDateFilter` · `components/admin/auction-date-filter.tsx` | 94 | 94 | month / 0 efectos; 8 controles; 5 handlers JSX | AuctionAdminFilters | Conservado: interacción acotada; estado y limpieza locales. |
| `AuctionReports` · `components/admin/auction-reports.tsx` | 180 | 83 | — / 0 efectos; 14 controles; 0 handlers JSX | AuctionReportsPage | Separado: gráfico y detalle regional; agregaciones conservadas en el padre. |
| `SummaryCard` · `components/admin/auction-reports.tsx` | 28 | 28 | — / 0 efectos; 0 controles; 0 handlers JSX | AuctionReports | Conservado: presentación o control específico sin estado independiente. |
| `AuctionScope` · `components/admin/auction-scope.tsx` | 24 | 24 | — / 0 efectos; 3 controles; 0 handlers JSX | AdminAuctionClientsPage, AdminAuctionEditPage, AdminAuctionLotsPage, AdminAuctionDashboardPage, AuctionReportsPage | Conservado: presentación o control específico sin estado independiente. |
| `BoardProjection` · `components/admin/board-projection.tsx` | 114 | 114 | — / 0 efectos; 3 controles; 2 handlers JSX | Board | Conservado: variantes de una misma vista; composición local suficiente. |
| `ProjectedLot` · `components/admin/board-projection.tsx` | 23 | 23 | — / 0 efectos; 2 controles; 0 handlers JSX | BoardProjection | Conservado: presentación o control específico sin estado independiente. |
| `ProjectedPrize` · `components/admin/board-projection.tsx` | 20 | 20 | — / 0 efectos; 3 controles; 0 handlers JSX | BoardProjection | Conservado: presentación o control específico sin estado independiente. |
| `LotMark` · `components/admin/board-projection.tsx` | 8 | 8 | — / 0 efectos; 1 controles; 0 handlers JSX | ProjectedLot | Conservado: presentación o control específico sin estado independiente. |
| `Board` · `components/admin/board.tsx` | 215 | 111 | text, regionId, page, expanded, selectedLot, fullscreen / 1 efectos; 13 controles; 11 handlers JSX | AdminAuctionDashboardPage | Separado: filtros y tabla; pantalla completa, modal y selección conservados. |
| `Stat` · `components/admin/board.tsx` | 9 | 9 | — / 0 efectos; 0 controles; 0 handlers JSX | Board, LotCard, PublicLotCard | Conservado: presentación o control específico sin estado independiente. |
| `PrizeStat` · `components/admin/board.tsx` | 22 | 22 | — / 0 efectos; 4 controles; 0 handlers JSX | Board | Conservado: presentación o control específico sin estado independiente. |
| `SaleRow` · `components/admin/board-sales-table.tsx` | 44 | 44 | — / 0 efectos; 3 controles; 1 handlers JSX | BoardSalesTable | Conservado: presentación o control específico sin estado independiente. |
| `LotInfoModal` · `components/admin/lot-info-modal.tsx` | 99 | 99 | — / 0 efectos; 13 controles; 2 handlers JSX | Board | Extraído junto a su funcionalidad; comportamiento conservado. |
| `InfoField` · `components/admin/lot-info-modal.tsx` | 8 | 8 | — / 0 efectos; 0 controles; 0 handlers JSX | LotInfoModal | Extraído junto a su funcionalidad; comportamiento conservado. |
| `LotNumber` · `components/admin/board-sales-table.tsx` | 8 | 8 | — / 0 efectos; 1 controles; 0 handlers JSX | SaleRow | Conservado: presentación o control específico sin estado independiente. |
| `FilterChip` · `components/admin/board-filters.tsx` | 30 | 30 | — / 0 efectos; 3 controles; 1 handlers JSX | BoardFilters | Conservado: presentación o control específico sin estado independiente. |
| `ClientManager` · `components/admin/client-manager.tsx` | 161 | 93 | associateOpen, pendingId, error / 0 efectos; 10 controles; 9 handlers JSX | AdminAuctionClientsPage | Separado: asociación responsive; comandos y errores conservados. |
| `DeleteButton` · `components/admin/delete-button.tsx` | 24 | 24 | — / 0 efectos; 0 controles; 1 handlers JSX | AuctionAdminRow, LotAdminRow | Conservado: presentación o control específico sin estado independiente. |
| `LotManager` · `components/admin/lot-manager.tsx` | 311 | 136 | detailsOpen, successMessage, confirmLeave, colorFilter, initialDraft / 0 efectos; 20 controles; 22 handlers JSX | AdminAuctionLotsPage | Separado: presentación del formulario y adaptadores de borrador; ciclo de edición conservado. |
| `MobileFormModal` · `components/admin/mobile-form-modal.tsx` | 32 | 32 | — / 0 efectos; 1 controles; 0 handlers JSX | AuctionCreateForm, AuctionEditor, ClientAssociationForm, LotEditorForm | Conservado: presentación o control específico sin estado independiente. |
| `RegionSelect` · `components/admin/region-select.tsx` | 27 | 27 | — / 0 efectos; 3 controles; 1 handlers JSX | BoardFilters | Conservado: presentación o control específico sin estado independiente. |
| `AuctionFloor` · `components/auction/auction-floor.tsx` | 33 | 33 | selectedId / 0 efectos; 1 controles; 1 handlers JSX | FavoritosContent | Conservado: interacción acotada; estado y limpieza locales. |
| `AuctionList` · `components/auction/auction-list.tsx` | 37 | 37 | — / 0 efectos; 1 controles; 0 handlers JSX | HomePage | Conservado: presentación o control específico sin estado independiente. |
| `BidBox` · `components/auction/bid-box.tsx` | 111 | 111 | custom, justPlaced, error / 1 efectos; 13 controles; 3 handlers JSX | BidGate | Conservado: interacción acotada; estado y limpieza locales. |
| `BidGate` · `components/auction/bid-gate.tsx` | 46 | 46 | — / 0 efectos; 6 controles; 1 handlers JSX | SelectedLotPanel, LotBidPanel, LotCardBidding | Conservado: presentación o control específico sin estado independiente. |
| `LotSearch` · `components/auction/catalog-filter-fields.tsx` | 27 | 27 | — / 0 efectos; 1 controles; 1 handlers JSX | DesktopCatalogFilters, MobileCatalogFilters | Conservado: presentación o control específico sin estado independiente. |
| `SexFilters` · `components/auction/catalog-filter-fields.tsx` | 54 | 54 | — / 0 efectos; 4 controles; 1 handlers JSX | DesktopCatalogFilters, MobileCatalogFilters | Conservado: presentación o control específico sin estado independiente. |
| `PriceFields` · `components/auction/catalog-filter-fields.tsx` | 56 | 56 | — / 0 efectos; 2 controles; 1 handlers JSX | DesktopCatalogFilters, MobileCatalogFilters | Conservado: presentación o control específico sin estado independiente. |
| `Catalog` · `components/auction/catalog.tsx` | 209 | 101 | filtersOpen / 0 efectos; 22 controles; 15 handlers JSX | AuctionCatalogPage | Separado: controles responsive y campos; URL, filtrado y paginación conservados. |
| `Countdown` · `components/auction/countdown.tsx` | 23 | 23 | clock / 1 efectos; 1 controles; 0 handlers JSX | SelectedLotPanel, LotCardBidding, LotDetailMedia | Conservado: interacción acotada; estado y limpieza locales. |
| `FavoriteButton` · `components/auction/favorite-button.tsx` | 56 | 56 | promptOpen, error / 0 efectos; 9 controles; 2 handlers JSX | LotCard, LotDetailHeading | Conservado: interacción acotada; estado y limpieza locales. |
| `LiveGallery` · `components/auction/live-gallery.tsx` | 152 | 118 | view, photoIndex, zoom / 0 efectos; 3 controles; 5 handlers JSX | LotDetailMedia, PublicLotDetails | Separado: ampliación y foco en GalleryZoom; selección y vídeo conservados. |
| `Stat` · `components/auction/lot-card.tsx` | 25 | 25 | — / 0 efectos; 0 controles; 0 handlers JSX | Board, LotCard, PublicLotCard | Conservado: presentación o control específico sin estado independiente. |
| `LotCard` · `components/auction/lot-card.tsx` | 191 | 83 | — / 0 efectos; 20 controles; 0 handlers JSX | FavoritosContent, AuctionFloor, Catalog, LotMobileList | Separado: presentación pública y sección de pujas; estructura visual conservada. |
| `LotMiniRow` · `components/auction/lot-mini-list.tsx` | 71 | 71 | — / 0 efectos; 6 controles; 1 handlers JSX | AuctionFloor, LotMobileList | Conservado: presentación o control específico sin estado independiente. |
| `LotMobileList` · `components/auction/lot-mini-list.tsx` | 34 | 34 | openId / 1 efectos; 4 controles; 1 handlers JSX | FavoritosContent, Catalog | Conservado: interacción acotada; estado y limpieza locales. |
| `LotScreen` · `components/auction/lot-screen.tsx` | 321 | 83 | — / 1 efectos; 34 controles; 0 handlers JSX | LotDetailPage | Separado: cabecera y medios; permisos, sesión y retornos conservados. |
| `SoldStamp` · `components/auction/sold-stamp.tsx` | 54 | 54 | — / 0 efectos; 10 controles; 0 handlers JSX | LiveGallery, LotCard | Conservado: presentación o control específico sin estado independiente. |
| `StatusBadge` · `components/auction/status-badge.tsx` | 29 | 29 | — / 0 efectos; 1 controles; 0 handlers JSX | LotCard | Conservado: presentación o control específico sin estado independiente. |
| `AdminGuard` · `components/auth/admin-guard.tsx` | 16 | 16 | — / 1 efectos; 4 controles; 0 handlers JSX | AdminShell | Conservado: interacción acotada; estado y limpieza locales. |
| `AuthPrompt` · `components/auth/auth-prompt.tsx` | 59 | 59 | — / 0 efectos; 1 controles; 3 handlers JSX | FavoriteButton | Conservado: presentación o control específico sin estado independiente. |
| `BuyerGuard` · `components/auth/buyer-guard.tsx` | 16 | 16 | — / 1 efectos; 4 controles; 0 handlers JSX | NotificationsPage, PujasPage | Conservado: interacción acotada; estado y limpieza locales. |
| `RequireAuth` · `components/auth/require-auth.tsx` | 20 | 20 | — / 1 efectos; 2 controles; 0 handlers JSX | AjustesPage, FavoritosClient | Conservado: interacción acotada; estado y limpieza locales. |
| `SessionProvider` · `components/auth/session-provider.tsx` | 143 | 143 | state / 1 efectos; 22 controles; 0 handlers JSX | RootLayout | Conservado: fachada de comandos y sesión; efectos con limpieza. |
| `SignInForm` · `components/auth/sign-in-form.tsx` | 74 | 74 | login, password, error / 0 efectos; 5 controles; 3 handlers JSX | EntrarPage | Conservado: interacción acotada; estado y limpieza locales. |
| `SignInBackLink` · `components/auth/sign-in-form.tsx` | 16 | 16 | — / 0 efectos; 3 controles; 0 handlers JSX | EntrarPage | Conservado: presentación o control específico sin estado independiente. |
| `SignUpForm` · `components/auth/sign-up-form.tsx` | 91 | 91 | name, email, password, paddle, regionId, error / 0 efectos; 3 controles; 6 handlers JSX | RegistroPage | Conservado: interacción acotada; estado y limpieza locales. |
| `CompetitionPanel` · `components/favorites/competition-panel.tsx` | 5 | 5 | — / 0 efectos; 2 controles; 0 handlers JSX | AuctionFloor | Conservado: presentación o control específico sin estado independiente. |
| `ActiveRace` · `components/favorites/competition-panel.tsx` | 54 | 54 | — / 0 efectos; 8 controles; 0 handlers JSX | CompetitionPanel | Conservado: presentación o control específico sin estado independiente. |
| `ClosedRace` · `components/favorites/competition-panel.tsx` | 14 | 14 | — / 0 efectos; 1 controles; 0 handlers JSX | CompetitionPanel | Conservado: presentación o control específico sin estado independiente. |
| `FavoritesViewToggle` · `components/favorites/view-toggle.tsx` | 42 | 42 | — / 0 efectos; 1 controles; 1 handlers JSX | FavoritesHeading | Conservado: presentación o control específico sin estado independiente. |
| `AppShell` · `components/layout/app-shell.tsx` | 36 | 36 | — / 0 efectos; 6 controles; 0 handlers JSX | RootLayout | Conservado: presentación o control específico sin estado independiente. |
| `BackLink` · `components/layout/back-link.tsx` | 39 | 39 | — / 0 efectos; 3 controles; 1 handlers JSX | BuyerSettings, FavoritosContent, NotificationsContent, PujasContent, AuctionCatalogPage, AdminBreadcrumbs, AuctionScope, LotScreen, PublicLotDetails, SignInBackLink, SignUpForm, TopBar | Conservado: presentación o control específico sin estado independiente. |
| `BrandMark` · `components/layout/brand-mark.tsx` | 14 | 14 | — / 0 efectos; 0 controles; 0 handlers JSX | AdminMobileMenu, AdminSidebar, DesktopNav, DesktopSidebar, MainMenuDrawer, TopBar | Conservado: presentación o control específico sin estado independiente. |
| `DesktopNav` · `components/layout/desktop-nav.tsx` | 17 | 17 | — / 0 efectos; 1 controles; 0 handlers JSX | AppShell | Conservado: presentación o control específico sin estado independiente. |
| `DesktopSidebar` · `components/layout/desktop-sidebar.tsx` | 94 | 94 | collapsed / 1 efectos; 17 controles; 3 handlers JSX | AppShell | Conservado: interacción e historial cohesionados; sin controlador genérico. |
| `LogicalBackGuard` · `components/layout/logical-back-guard.tsx` | 73 | 73 | — / 1 efectos; 25 controles; 0 handlers JSX | AppShell | Conservado: interacción e historial cohesionados; sin controlador genérico. |
| `MainMenuDrawer` · `components/layout/main-menu-drawer.tsx` | 164 | 97 | open, previousPath / 1 efectos; 29 controles; 7 handlers JSX | AppShell, TopBar | Separado: historial, teclado y gestos en useMainMenuDrawer; sesión y navegación en el componente. |
| `TopBar` · `components/layout/top-bar.tsx` | 58 | 58 | — / 0 efectos; 4 controles; 0 handlers JSX | BuyerSettings, FavoritosContent, NotificationsContent, HomePage, PujasContent, AuctionCatalogPage, LotScreen, PublicLotDetails | Conservado: presentación o control específico sin estado independiente. |
| `BuyerNotificationToasts` · `components/notifications/buyer-notification-toasts.tsx` | 68 | 68 | visible / 4 efectos; 9 controles; 2 handlers JSX | AppShell | Conservado: interacción acotada; estado y limpieza locales. |
| `AuctionAdminFilters` · `components/admin/auction-admin-filters.tsx` | — | 40 | — / 0 efectos; 2 controles; 4 handlers JSX | AuctionAdminList | Nueva extracción con responsabilidad específica. |
| `AuctionAdminRow` · `components/admin/auction-admin-row.tsx` | — | 70 | — / 0 efectos; 1 controles; 4 handlers JSX | AuctionAdminList | Nueva extracción con responsabilidad específica. |
| `AuctionCreateForm` · `components/admin/auction-create-form.tsx` | — | 70 | draft, confirmCreateLeave / 0 efectos; 4 controles; 7 handlers JSX | AuctionAdminList | Nueva extracción con responsabilidad específica. |
| `AvailableClientSelect` · `components/admin/client-association-form.tsx` | — | 10 | — / 0 efectos; 0 controles; 0 handlers JSX | ClientAssociationForm | Nueva extracción con responsabilidad específica. |
| `LotAdminRow` · `components/admin/lot-admin-row.tsx` | — | 61 | — / 0 efectos; 1 controles; 4 handlers JSX | LotManager | Nueva extracción con responsabilidad específica. |
| `LotFields` · `components/admin/lot-fields.tsx` | — | 78 | — / 0 efectos; 2 controles; 11 handlers JSX | LotEditorForm | Nueva extracción con responsabilidad específica. |
| `LotBidPanel` · `components/auction/lot-bidding.tsx` | — | 38 | — / 0 efectos; 3 controles; 0 handlers JSX | LotScreen | Nueva extracción con responsabilidad específica. |
| `LotBidHistory` · `components/auction/lot-bidding.tsx` | — | 88 | — / 0 efectos; 6 controles; 0 handlers JSX | LotScreen | Nueva extracción con responsabilidad específica. |
| `LotDetailFacts` · `components/auction/lot-detail-facts.tsx` | — | 12 | — / 0 efectos; 0 controles; 0 handlers JSX | LotScreen, PublicLotDetails | Nueva extracción con responsabilidad específica. |
| `PublicLotDetails` · `components/auction/public-lot-details.tsx` | — | 15 | — / 0 efectos; 0 controles; 0 handlers JSX | LotScreen | Nueva extracción con responsabilidad específica. |

Revisión de dependencias: 129 archivos TS/TSX y 450 referencias locales estáticas, incluidos imports de tipos y reexportaciones. Ciclos encontrados: **0**. No se detectaron componentes nuevos sin consumidor JSX; la exportación de compatibilidad del editor sigue teniendo su consumidor de ruta. No se inspeccionan dependencias dinámicas mediante esta comprobación.

Hooks revisados: `useEntityEditor` (borrador/errores y cierre), `useUnsavedChanges` (captura y reanudación), `useModalFocus` (pila, foco y bloqueo de scroll), `useFavoritesView`, `useBuyerPhoto`, `useDemoNotifications`, `useProjectionRows` y `useAuctionSync`. Solo este último se extrajo; los restantes conservan su responsabilidad y limpieza de suscripciones.
| `AdminMobileMenu` · `components/admin/admin-mobile-menu.tsx` | — | 71 | — / 1 efectos directos | AdminSidebar | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `AuctionEditorActions` · `components/admin/auction-editor-actions.tsx` | — | 74 | pendingDelete / 0 efectos directos | AuctionEditor | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `ReportRegionChart` · `components/admin/auction-report-regions.tsx` | — | 64 | — / 0 efectos directos | AuctionReports | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `ReportRegionDetails` · `components/admin/auction-report-regions.tsx` | — | 51 | — / 0 efectos directos | AuctionReports | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `BoardFilters` · `components/admin/board-filters.tsx` | — | 61 | — / 0 efectos directos | Board | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `BoardSalesTable` · `components/admin/board-sales-table.tsx` | — | 64 | — / 0 efectos directos | Board | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `ClientAssociationForm` · `components/admin/client-association-form.tsx` | — | 64 | associateOpen / 0 efectos directos | ClientManager | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `LotEditorForm` · `components/admin/lot-editor-form.tsx` | — | 62 | — / 0 efectos directos | LotManager | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `CatalogFilters` · `components/auction/catalog-filters.tsx` | — | 11 | filtersOpen / 0 efectos directos | Catalog | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `DesktopCatalogFilters` · `components/auction/catalog-filters.tsx` | — | 65 | — / 0 efectos directos | CatalogFilters | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `MobileCatalogFilters` · `components/auction/catalog-filters.tsx` | — | 51 | — / 0 efectos directos | CatalogFilters | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `GalleryZoom` · `components/auction/live-gallery.tsx` | — | 40 | — / 0 efectos directos | LiveGallery | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `LotCardBidding` · `components/auction/lot-card-bidding.tsx` | — | 97 | — / 0 efectos directos | LotCard | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `PublicLotCard` · `components/auction/lot-card.tsx` | — | 20 | — / 0 efectos directos | LotCard | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `LotDetailMedia` · `components/auction/lot-detail-header.tsx` | — | 71 | — / 0 efectos directos | LotScreen | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |
| `LotDetailHeading` · `components/auction/lot-detail-header.tsx` | — | 37 | — / 0 efectos directos | LotScreen | Extraído en segunda revisión: responsabilidad de presentación o interacción específica. |

## B. Responsabilidades separadas

- **AuctionAdminList:** coordina apertura, aviso de creación, filtros y acciones administrativas. `AuctionCreateForm` posee borrador y confirmación de salida; presenta los errores de los comandos proporcionados por el coordinador. Este último mantiene el error compartido con eliminación para conservar el comportamiento cuando se elimina una fila con el formulario abierto. `AuctionAdminFilters` presenta controles sin duplicar estado; `AuctionAdminRow` presenta una fila y comunica intenciones mediante callbacks. Las selecciones pendientes de publicación y eliminación siguen siendo únicas y pertenecen al listado. No existía ordenamiento adicional: se conserva el orden de la colección.
- **AuctionEditor:** se localiza independientemente del listado. Conserva guardado, eliminación, borrador, publicación y navegación diferenciada por tamaño de pantalla. `useAuctionSync` reúne confirmación, ejecución, exclusión de dobles envíos, mensajes y suscripción a la fecha persistida de la simulación. Recibe explícitamente subasta, borrador y lotes; no accede al contexto de sesión.
- **LotManager:** conserva el flujo de edición y envío, protección de borradores, confirmación única de eliminación, numeración y mensajes. `LotFields` recibe el borrador y callbacks tipados; `LotAdminRow` presenta los datos y acciones. No se trasladó el formulario completo a un hook. «Guardar y agregar otro» sigue reteniendo vendedor y estableciendo ese borrador como punto inicial limpio.
- **Board:** el diálogo `LotInfoModal` vive junto a la pizarra con su detalle privado `InfoField` y gestión de foco. El coordinador mantiene proyección, pantalla completa, filtros y paginación. No cambió la tabla ni el botón explícito que abre información.
- **LotScreen:** mantiene sesión, permisos, selección del lote y política de retorno. Delega ficha pública, panel de puja e historial. `LotDetailFacts` reemplaza las dos fichas idénticas sin añadir elementos HTML. Las vistas aceptan `Lot | BuyerLot`; no reconstruyen identidad ni añaden modelos persistidos.
- **ClientManager:** un selector local `AvailableClientSelect` sustituye el marcado duplicado de opciones. Los formularios móvil y escritorio mantienen sus etiquetas, distribución, validación nativa, reset tras éxito y comportamiento ante error.

## C. Componentes y hook extraídos

Todos están colocados junto a sus consumidores y siguen la convención de nombres del repositorio. No se añadieron carpetas, archivos índice, contextos, servicios, dependencias ni capas.

| Archivo | Responsabilidad y consumidores |
|---|---|
| `components/admin/auction-create-form.tsx` | Creación y salida con borrador; listado administrativo. |
| `components/admin/auction-admin-filters.tsx` | Controles de nombre, lugar y rango de fechas; listado. |
| `components/admin/auction-admin-row.tsx` | Presentación y callbacks de una fila; listado. |
| `components/admin/auction-editor.tsx` | Configuración de una subasta; ruta de edición. La exportación previa desde `auction-admin.tsx` se conserva explícitamente. |
| `components/admin/auction-fields.tsx` | Campos y borrador inicial de subasta; creación y edición. |
| `components/admin/auction-status-controls.tsx` | Resumen, acciones y confirmación de publicación compartidos; editor y listado/filas. Conserva el adaptador de entrada existente. |
| `components/admin/use-auction-sync.ts` | Ciclo de sincronización simulada; editor. |
| `components/admin/lot-fields.tsx` | Campos básicos/adicionales y borrador inicial de lote; gestor de lotes. |
| `components/admin/lot-admin-row.tsx` | Datos y acciones de una fila; gestor de lotes. |
| `components/admin/lot-info-modal.tsx` | Información modal, teclado y foco; pizarra. |
| `components/auction/public-lot-details.tsx` | Ficha pública del detalle; pantalla de lote. |
| `components/auction/lot-detail-facts.tsx` | Ficha de datos repetida; detalle público y autenticado. Recibe solamente las capacidades necesarias mediante `Pick<Lot, ...>`. |
| `components/auction/lot-bidding.tsx` | Panel de acceso/resultado e historial de pujas; pantalla de lote. Ambos componentes permanecen juntos por pertenecer a la misma sección. |

`AvailableClientSelect` permanece privado junto a las dos variantes del formulario en `client-association-form.tsx`.

## D. Decisiones de la primera revisión

Las extracciones adicionales de la sección H sustituyen las decisiones iniciales sobre Catalog, LotCard, AuctionReports y los menús; el resto de estas decisiones se mantiene.

- **Catalog y sus controles locales:** filtros reflejados en URL, selección y paginación forman un mismo flujo. Búsqueda, sexo y precio ya tienen límites de presentación claros. Las diferencias móvil/escritorio y público/comprador son intencionales; no se unificaron mediante configuraciones genéricas.
- **LotCard, LotMiniRow, LotMobileList, AuctionFloor y CompetitionPanel:** presentan variantes de lote y selección; las reglas permanecen en helpers de dominio o en `BidGate`. Dividir cada rama produciría pasos de navegación innecesarios entre archivos.
- **Mis pujas:** `PujasContent`, `BidSection`, `BidLotRow` y `SelectedLotPanel` ya separan coordinación, agrupación, fila y detalle. Se conserva la clasificación sobre `BuyerLot`.
- **AuctionReports:** agregación derivada y presentación del mismo reporte, sin efectos ni estado de edición; resumen, barras y detalle regional no requieren nuevos hooks.
- **BoardProjection:** conserva su hook privado para medición de filas y sus componentes de proyección. Su evento de resize tiene limpieza y depende del número de lotes.
- **SessionProvider:** fachada de sesión con repositorio estable, comandos delegados y proyecciones memoizadas. No se fragmenta el contexto sin una necesidad demostrada.
- **Menús y navegación:** se mantienen historial, swipe, cierre por ruta, restauración de foco y limpieza de eventos. Sus diferencias de interacción impiden sustituirlos mecánicamente por un único controlador de overlays.
- **Autenticación, cuenta, avisos, guards y componentes pequeños:** responsabilidades acotadas y casos de uso existentes. Las múltiples variables de un formulario o efectos de suscripción con limpieza no constituyen por sí solos una razón para extraer un hook.
- **Páginas y layouts:** conservan composición y límites servidor/cliente. Se revisó la guía incluida en Next 16.3.8; las extracciones interactivas permanecen bajo límites cliente existentes.

## E. Mejoras arquitectónicas

La creación tiene un dueño claro para su borrador y protección de salida. La sincronización puede entenderse sin recorrer las operaciones de edición. Las filas no importan la sesión ni ejecutan comandos; reciben intenciones tipadas. Los campos no conocen permisos, persistencia ni navegación. La ficha pública no necesita conocer el enrutador ni los datos de la cuenta. Se eliminan duplicaciones concretas de datos del animal y opciones de clientes.

Los datos siguen fluyendo del coordinador a las vistas y las intenciones vuelven mediante callbacks. No se pasan objetos completos de editor ni se sincroniza estado duplicado mediante efectos. Se mantiene la autoridad de los comandos y no se introducen validaciones de negocio paralelas.

## F. Verificaciones de la primera revisión

| Comprobación | Resultado |
|---|---|
| `pnpm check` | Aprobado: ESLint sin errores/advertencias, `next typegen` y TypeScript aprobados, **39/39 pruebas**. |
| `pnpm build` | Aprobado con webpack: compilación, tipos, generación de 13 páginas estáticas y rutas dinámicas. Primer intento falló por EPERM del sandbox al crear un directorio generado; el reintento autorizado fuera del sandbox finalizó con código 0. |
| Imports y componentes extraídos | Sin imports rotos ni componentes nuevos sin consumidor; reexportación previa del editor conservada. |
| Grafo local | 129 archivos TS/TSX, 450 referencias estáticas, **0 ciclos**. Incluye imports de tipos y reexportaciones. |
| Clases de las vistas afectadas | Las **268 cadenas de clases distintas** presentes en atributos JSX antes de extraer siguen presentes después; ninguna añadida ni retirada. Las recetas compartidas no cambiaron. Esto no sustituye la comparación visual. |
| Persistencia y permisos | Código de dominio/aplicación/sesión intacto; las pruebas de permisos, incremento mínimo, proyecciones, migraciones y almacenamiento siguen pasando. |
| Navegador | Verificados los flujos enumerados a continuación en desarrollo y el detalle también desde el build de producción. |

Recorridos ejecutados:

- Creación con error por título vacío y con datos válidos; sugerencia de agregar lotes; publicación rechazada por datos incompletos y publicación válida con fechas futuras.
- Filtros por nombre, lugar y rango de dos días, limpieza y estado sin resultados.
- Guardado del editor: permanece en escritorio y vuelve al listado en móvil; sincronización simulada con confirmación, estado ocupado, éxito y fecha persistida. Eliminación de los registros temporales usados en QA.
- Cancelación de salida, continuidad de edición y descarte con reanudación del enlace solicitado tanto desde creación como desde lotes.
- Alta de lote, guardar y agregar otro, conservación de vendedor y cierre sin falsa confirmación del siguiente borrador limpio; edición, guardado y eliminación del lote temporal.
- Asociación y desasociación de un cliente existente, restaurando la asociación original al terminar.
- Pizarra con paginación y búsqueda vacía; apertura del modal, Tab, Shift+Tab, Escape y retorno del foco al lote. Entrada en pantalla completa y salida por Escape con retorno a Ampliar.
- Formulario móvil a 390×844: foco inicial, recorrido circular inverso/directo, cierre por Escape y publicación/guardado.
- Detalle público sin importes ni identidades comerciales; lote cerrado oculto al visitante. Detalle de comprador con rivales anonimizados y resultado «Ganado por ti» sin historial rival. Detalle administrativo con su información completa.
- Puja inferior al incremento rechazada sin alterar la oferta; «Mis pujas» conserva dos activas y una ganada; navegación normal desde Mis pujas al detalle y regreso. El guard redirige al comprador que intenta abrir administración.

Se conservaron capturas en [output/qa-componentes](../output/qa-componentes/). Se compararon creación, edición de lotes, modal y detalle. El detalle móvil usa los mismos datos y dimensiones antes/después; se conserva la presentación, con la diferencia esperada del indicador de desarrollo al compararlo con producción. En escritorio las capturas tienen diferencias de viewport, estado expandido del menú o altura de captura; se realizó comparación visual, sin afirmar equivalencia automática píxel a píxel. Las fechas de los estados de subasta pueden evolucionar entre capturas.

No se añadieron pruebas que reproduzcan el marcado extraído ni una nueva infraestructura de pruebas. Se usaron las pruebas de comportamiento existentes y recorridos de interfaz sobre las fronteras modificadas. Los datos temporales se eliminaron y los filtros y la cuenta administrativa se restauraron. El contador y los avisos demo siguen su comportamiento previo.

## G. Pendientes y límites

No queda ninguna decisión necesaria para completar la refactorización estructural.

**Comportamiento previo observado, conservado:** al abrir directamente un detalle con `returnTo` y existir una entrada previa ajena a ese destino, Volver usa `router.back()` y puede regresar a esa entrada. Se reprodujo entrando directamente a un lote con `returnTo=/pujas` desde otro lote. El flujo normal Mis pujas → detalle → Volver sí regresó a Mis pujas. La condición `historyBack={!!safeReturn}` y BackLink ya existían en el código anterior y no se modificaron. Cambiar su política requiere un ajuste funcional separado.

No se forzó la superposición de diálogos fuera de los flujos que permite la interfaz; la pila del hook compartido permanece intacta. Esta verificación no certifica todos los lectores de pantalla ni todos los tamaños de dispositivo.

El servidor de desarrollo existente del usuario en el puerto 3000 se dejó en ejecución. El servidor de producción temporal utilizado para contrastar las capturas se detuvo al terminar. Las diferencias generadas en `next-env.d.ts` se restauraron para no incluir ruido de build en el cambio.

## H. Segunda revisión por tamaño y responsabilidades

Se revisaron de nuevo todas las funciones de componentes, incluidas las privadas. El tamaño se usó para localizar responsabilidades separables. Tras esta revisión ninguna de las 131 funciones de componentes declaradas en `app` y `components` supera 150 líneas; la mayor es `SessionProvider`, con 143. No se dividió el contexto ni se añadieron dependencias.

Las cifras siguientes comparan la primera implementación con esta segunda revisión. Las líneas de archivo excluyen el salto vacío final; las de componente incluyen firma, cuerpo y espacios internos.

| Componente | Función antes → después | Archivo antes → después | Responsabilidad extraída |
|---|---:|---:|---|
| AuctionEditor | 176 → 114 | 192 → 130 | Acciones de sincronización y confirmación de eliminación. |
| LotManager | 204 → 136 | 220 → 152 | Presentación del formulario y conversiones de borrador. |
| Board | 215 → 111 | 361 → 170 | Filtros, tabla de ventas y paginación visual. |
| AuctionReports | 180 → 83 | 222 → 124 | Gráfico regional y detalle de lotes por zona. |
| ClientManager | 151 → 93 | 173 → 103 | Formulario de asociación móvil y escritorio. |
| AdminSidebar | 159 → 105 | 209 → 137 | Menú móvil, bloqueo de scroll y ciclo de foco. |
| Catalog | 209 → 101 | 373 → 121 | Controles responsive y campos compartidos. |
| LotCard | 191 → 83 | 231 → 143 | Ficha pública y presentación de pujas. |
| LiveGallery | 152 → 118 | 164 → 171 | Zoom con foco propio, privado junto a la galería. |
| LotScreen | 180 → 83 | 202 → 100 | Medios, estado y cabecera del lote. |
| MainMenuDrawer | 164 → 97 | 180 → 113 | Hook específico de historial, teclado y gestos. |

`LiveGallery` crece como archivo al hacer explícito el contrato del zoom, mientras su función principal se reduce. `app/pujas/page.tsx`, `board-projection.tsx`, el proveedor de sesión y los módulos de filtros siguen teniendo archivos mayores de 150 líneas porque agrupan componentes pequeños o tipos relacionados. Sus responsabilidades ya están separadas; mover cada función a otro archivo no aporta una frontera adicional.

### Archivos añadidos en esta revisión

| Archivo | Propósito y consumidor |
|---|---|
| `components/admin/auction-editor-actions.tsx` | Sincronización, resultado, fecha y confirmación de borrado; AuctionEditor. El guardado sigue siendo submit del formulario padre. |
| `components/admin/lot-editor-form.tsx` | Presentación del formulario; LotManager conserva borrador, comandos, errores, salida y guardado consecutivo. |
| `components/admin/board-filters.tsx` | Búsqueda, región y acción Ampliar; Board. |
| `components/admin/board-sales-table.tsx` | Tabla semántica, filas, vacío y paginación; Board. |
| `components/admin/auction-report-regions.tsx` | Gráfico y detalle regional sin estado; AuctionReports calcula las agregaciones. |
| `components/admin/client-association-form.tsx` | Dos presentaciones y selector privado; ClientManager conserva comando y error. |
| `components/admin/admin-mobile-menu.tsx` | Presentación y efecto de foco del menú administrativo; AdminSidebar. |
| `components/auction/catalog-filters.tsx` | Variantes responsive y apertura de filtros; Catalog. |
| `components/auction/catalog-filter-fields.tsx` | Búsqueda, sexo y precios usados por ambas variantes. |
| `components/auction/lot-card-bidding.tsx` | Rama activa/cerrada de la tarjeta; LotCard. |
| `components/auction/lot-detail-header.tsx` | Medios y cabecera; LotScreen conserva resolución de sesión, permisos y retorno. |
| `components/layout/use-main-menu-drawer.ts` | Ciclo específico de apertura, historial, foco y swipe; MainMenuDrawer conserva sesión y navegación. |

Los adaptadores `lotDraftFromLot` y `lotInputFromDraft` quedan junto a los campos del lote. Conservan exactamente el mapeo anterior, incluido precio mostrado, imágenes, fecha y estado de edición/creación. No son reglas nuevas del dominio. `GalleryZoom` y `PublicLotCard` permanecen privados en sus módulos. No se añadieron índices, interfaces por función ni un controlador genérico de overlays.

### Verificación de esta revisión

- `pnpm check`: aprobado; lint, generación oficial de tipos y TypeScript, **39/39 pruebas**. La ejecución dentro del sandbox demoró sin resultados; la ejecución autorizada fuera del sandbox finalizó con código 0.
- `pnpm build`: aprobado con webpack, tipos y generación de las 13 páginas estáticas. Se detuvo únicamente el servidor temporal del puerto 3100 antes de compilar.
- Grafo de 135 archivos TS/TSX de producción, 472 referencias estáticas locales, **0 ciclos**. Los imports CSS se excluyen del grafo de módulos TypeScript.
- Las **780 cadenas distintas de clases en atributos JSX** de todo `app` y `components` coinciden con la referencia de la primera implementación: ninguna añadida ni retirada.
- Catálogo: filtros responsive, URL `min=9000` y resultado de un lote; la captura móvil de filtros antes/después tiene el mismo SHA-256 y dimensiones 375×1528. Esto confirma esa vista concreta, no toda la aplicación.
- Pizarra: páginas 1/6 y 2/6, búsqueda sin resultados, apertura del lote, Escape y foco devuelto al botón del lote; apertura/cierre de proyección. El ciclo de pantalla completa no se modificó.
- Reporte: total $63,200, 30 adjudicados, promedio $2,106.67 y regiones; desplegable Boquerón con sus 20 lotes.
- Menú administrativo móvil a 390×844: foco inicial, Shift+Tab al último control, Escape y retorno al disparador.
- Editor: confirmación de sincronización, botón deshabilitado durante ejecución, éxito y fecha; confirmación de borrado cancelada; borrador, cancelación de salida y descarte con reanudación hacia Lotes.
- Lotes: alta temporal, Guardar y agregar otro, vendedor retenido, borrador limpio siguiente, edición/guardado y eliminación del lote temporal.
- Clientes: asociación desde el formulario móvil y desasociación posterior; asociación original restaurada.
- Galería: selección de Foto 2, zoom, Escape y retorno del foco al botón HD; sin errores de consola en el recorrido.
- Detalle público sin importes ni historial; comprador con dos pujas activas y una ganada en Mis pujas y resultado Ganado por ti. Cuenta administrativa restaurada al terminar.

Las capturas de esta revisión usan el prefijo `segunda-` en `output/qa-componentes`. Se contrastaron pizarra, reporte, menú y catálogo. En escritorio cambió el estado expandido del menú entre capturas; no se afirma equivalencia píxel a píxel de esas vistas. Los nuevos componentes reciben datos y callbacks explícitos, y todos tienen consumidores.

### Hallazgo funcional previo, fuera del cambio estructural

Cerrar el menú general mediante Escape puede redirigir del catálogo al inicio: el menú usa `history.back()` para retirar su entrada, y el listener de `LogicalBackGuard` interpreta ese `popstate` como regreso al padre de la ruta. El ciclo del menú extraído coincide con el anterior y ese guard no se modificó. Se conserva el comportamiento y se registra para un ajuste funcional separado; no se declara aprobado el retorno de foco en ese caso. La trampa de foco del menú general sí recorrió desde Cerrar menú hasta Cerrar sesión. No se automatizó el gesto táctil de swipe.

Se mantuvieron las pruebas de negocio existentes y se verificaron manualmente las fronteras extraídas; no se añadieron tests que reproduzcan el JSX ni infraestructura nueva. El registro temporal del lote y la asociación de QA se retiraron. La fecha de sincronización demo refleja la prueba ejecutada.
