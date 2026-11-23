# platform-pierinachame-shop-angular


## Dependencies

This project is built with strict adherence to high performance, deterministic reactivity, and AOT (Ahead-Of-Time) compilation readiness. Unnecessary abstractions and bloated wrapper libraries have been excluded.

- **Core & Runtime:** Node.js 18.x, TypeScript 5.5, Angular 18.2 (Standalone Components, Built-in Control Flow `@if`/`@for`, `ChangeDetectionStrategy.OnPush`)
- **Reactivity & State:** Angular Signals (`signal`, `computed`) for local and feature UI state, RxJS 7.8 for asynchronous streams and HTTP operations
- **UI & Design System:** Tailwind CSS 3.4 (utility-first, zero runtime CSS overhead), PrimeNG 18 (Unstyled Mode + PassThrough Architecture), PrimeIcons 8.0
- **Routing & Security:** Standalone Lazy-Loaded Route Trees (`loadComponent`), Functional Route Guards (`CanActivateFn`), Functional HTTP Interceptors (`HttpInterceptorFn`), OAuth2/JWT Bearer authentication
- **Forms & Validation:** Strictly Typed Reactive Forms (`FormGroup`, `FormControl`, `Validators`)
- **Testing & Quality:** Karma + Jasmine, Headless Chrome CI runners, Strict TypeScript compilation (`strict: true`, `noImplicitAny`), Prettier 3.x

## Running the Project

In your terminal, install dependencies and verify the package dependency tree:

```bash
npm install
npm ls
```

To start the local development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application automatically reloads on source code changes.

To build the application for production (AOT compiled, minified bundles, budget-validated):

```bash
npm run build
```

To execute unit tests via Karma in interactive or headless CI mode:

```bash
npm test                                           # Interactive Karma watch mode
ng test --watch=false --browsers=ChromeHeadless     # Single-run headless CI execution
```

## Version Control Guidelines

- Every new feature or fix must be implemented in a dedicated branch.
- Direct commits to the `main` branch are strictly forbidden.
- Commit messages must follow the Conventional Commits specification (e.g., `type: description`), written in the imperative mood.

Example:
```bash
git commit -m "feat: implement real-time inventory synchronization"
```

After committing, push your branch to the remote repository:
```bash
git push origin <branch-name>
```
Open a Pull Request on GitHub and assign the project owner as a reviewer.

## Project Structure

This project follows a **Layered Feature-First Architecture** (Modular Monolith on the frontend). Code is grouped into unidirectional dependency layers and autonomous vertical slices, ensuring high business cohesion, strict encapsulation, and zero circular dependencies.

```sh
.
└── src
    ├── index.html
    ├── main.ts
    ├── styles.css                         <-- Global styles (@tailwind directives + base layer)
    └── app
        ├── app.component.ts               <-- Root shell (<router-outlet>)
        ├── app.config.ts                  <-- App providers (Router, HttpClient + Interceptors)
        ├── app.routes.ts                  <-- Root lazy-loaded route declarations
        │
        ├── core                           <-- Cross-cutting technical infrastructure (Zero UI)
        │   ├── auth                       <-- Session lifecycle, JWT interceptor, Role guards
        │   │   ├── auth.guard.ts
        │   │   ├── auth.interceptor.ts
        │   │   ├── auth.model.ts
        │   │   └── auth.service.ts
        │   └── http                       <-- HTTP tokens & Problem Details contracts
        │       ├── api-base-url.token.ts
        │       └── problem-detail.model.ts
        │
        ├── domain                         <-- Shared business contracts (Used across 2+ features)
        │   ├── catalog                    <-- Catalog, product categories & pricing models
        │   ├── order                      <-- Order entities, item contracts & status types
        │   ├── product                    <-- Products, SKUs & inventory contracts
        │   └── customer                   <-- Customer accounts & contact models
        │
        ├── shared                         <-- Reusable presentation primitives
        │   ├── layouts                    <-- Persistent layout shells (Topbar, Sidebar)
        │   │   └── shell
        │   │       ├── shell.component.ts
        │   │       ├── sidebar.component.ts
        │   │       └── topbar.component.ts
        │   └── ui                         <-- Dumb presentation components & PassThrough presets
        │       ├── dropdown
        │       └── entity-maintenance
        │
        └── features                       <-- Autonomous business domains (Vertical Slices)
            ├── auth                       <-- Authentication & Login views
            ├── catalog                    <-- Product catalog, pricing & search
            ├── orders                     <-- Order creation, lifecycle & ticket views
            │   ├── order.routes.ts        <-- Feature sub-routes (lazy-loaded)
            │   ├── order.store.ts         <-- Signal-based state store (snapshot + deltas)
            │   ├── order-board            <-- Routed Smart Component (OnPush)
            │   └── order-ticket           <-- Feature-private presentation component
            ├── inventory                  <-- Stock levels & warehouse allocations
            ├── customers                  <-- Customer directory & management
            └── admin                      <-- Users, organizations, branches & system settings
```

### Folder Structure Explanation

1. **`core/`**
   Contains cross-cutting technical infrastructure that applies across the entire frontend. Singletons only, strictly zero UI and zero business logic.
   - `auth/`: Session management, token storage, JWT HTTP interceptors, and functional route/role guards (`CanActivateFn`).
   - `http/`: Base API URL injection tokens, error normalization (RFC 7807 Problem Details), and request/response interceptors.
   - `realtime/` (when applicable): Centralized WebSocket / SSE connection management, handling automatic reconnects and connection status signals.

2. **`domain/`**
   Encapsulates shared business entities, models, and shared API services. A business model or API client belongs in `domain/` strictly when it is consumed by two or more features (Rule of 2+). Single-consumer entities remain encapsulated within their respective feature.
   - **Entity Models:** Immutable TypeScript interfaces and types representing core business concepts (e.g., `Product`, `Order`, `Customer`).
   - **API Services:** Direct, type-safe HTTP clients communicating with backend endpoints.

3. **`shared/`**
   Reusable presentation building blocks with no direct business rules or HTTP dependencies.
   - `layouts/`: Persistent layout wrappers (e.g., application shell, sidebar navigation, top bar).
   - `ui/`: Stateless ("dumb") UI components communicating exclusively via `@Input()` and `@Output()`.
   - `ui/pass-through/`: Centralized PrimeNG PassThrough presets, providing single-point Tailwind styling across unstyled UI components without wrapper components.

4. **`features/` (e.g., `catalog/`, `orders/`, `inventory/`, `admin/`)**
   Autonomous vertical slices representing business capabilities. Each feature encapsulates everything required to deliver its domain:
   - **`*.routes.ts`**: Feature routing table, lazy-loaded via `loadComponent` or `loadChildren`.
   - **`*.store.ts`**: Feature state store built with Angular Signals (`signal`, `computed`). Manages state snapshots, local mutations, and asynchronous lifecycle triggers.
   - **Smart Components (Container/Page):** Routed components (`ChangeDetectionStrategy.OnPush`) that inject services/stores, handle user interactions, and bind state to the template.
   - **Dumb Components:** Feature-private presentation controls not shared outside the feature.

## Architectural Invariants

- **Unidirectional Layer Boundaries:** Dependencies flow strictly downward: `core` < `domain` < `shared` < `features`. A feature never imports from another feature.
- **Promotion Rule:** Utilities, components, or services are promoted to `domain/` or `shared/` only when required by two or more independent consumers.
- **OnPush & Deterministic Reactivity:** Every component implements `ChangeDetectionStrategy.OnPush`. Synchronous UI state is governed by Signals; asynchronous operations and streams use RxJS.
- **No Speculative Abstraction:** Clean Code, DRY, KISS, and SOLID principles applied rigorously. No wrapper components around PrimeNG or third-party libraries; styling is applied via centralized PassThrough presets.          