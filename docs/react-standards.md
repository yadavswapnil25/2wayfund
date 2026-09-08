# React & Frontend Engineering Standards
This document outlines the specific conventions, patterns, and rules for the React frontend of the 2wayfund portal.

## 1. Project Overview & Stack
- **Framework:** React 18+ (with hooks-based function components)
- **Rendering:** Server-Side Rendering (SSR) via Next.js (or Remix, if applicable)
- **Languages:** TypeScript, JSX/TSX, SCSS / CSS Modules

## 2. Server-Side Rendering (SSR) Rules
- The application heavily relies on SSR to consume the Laravel REST APIs.
- Keep API responses optimized for SSR. Avoid requesting massive payloads during the initial server render to prevent slow Time-to-First-Byte (TTFB).
- **Avoid browser-specific APIs** (like `window`, `document`, or `localStorage`) directly during render or in the component body. Always guard with a `typeof window !== 'undefined'` check, or move the logic into a `useEffect` hook (which only runs client-side).
- Use framework-native data fetching (e.g. `getServerSideProps` / `fetch` in Server Components) carefully to prevent duplicate API calls between the server render and client hydration.
- Prefer React Server Components (where the framework supports them) for data-heavy, non-interactive sections to reduce client bundle size and avoid unnecessary hydration.

## 3. General React Best Practices
- **Strict Typing:** Enable and respect `strict` mode in TypeScript. Do not use `any` unless absolutely necessary and documented.
- **Component Design:** Keep components small, modular, and focused on a single responsibility. Favor a Container/Presentational (Smart/Dumb) split — container components handle data and logic, presentational components handle markup and styling.
- **State Management:** Keep local component state minimal (`useState`/`useReducer`). Pass data down via props and lift state up or use context only when genuinely shared across the tree. Avoid prop drilling beyond 2–3 levels — reach for Context or a state library instead.
- **Hooks Discipline:** Follow the Rules of Hooks (only call hooks at the top level, only from React functions). Extract reusable logic into custom hooks rather than duplicating it across components.
- **Memoization:** Use `React.memo`, `useMemo`, and `useCallback` deliberately to avoid unnecessary re-renders — but don't over-optimize prematurely; profile first.
- **Bundle Size:** Strictly monitor bundle size. Use dynamic `import()` / `React.lazy` + `Suspense` for heavy routes and components.
- **Styling:** Use SCSS Modules or CSS-in-JS (per project convention). Keep styles scoped to their respective components to prevent CSS bleeding.

## 4. API Consumption
- All API calls must include the required `X-Client-Key` header, managed centrally (e.g. via a shared `fetch`/`axios` wrapper or interceptor, not duplicated per-call).
- Consume the Laravel API responses utilizing the standard `{ status, message, data, errors }` format.
- Ensure error handling gracefully catches HTTP exceptions and displays user-friendly messages rather than exposing backend JSON errors directly to the user.
- Centralize API logic in dedicated service/hook modules (e.g. `useUserApi`, `services/userService.ts`) rather than calling `fetch` directly inside components.
