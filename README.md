# XState + Pinia Caching Demo (Nuxt 4)

This project demonstrates request orchestration with **XState** and shared client caching with **Pinia**.

It includes two flows:

- **Users flow**: route-driven fetch from `https://dummyjson.com/users/:id`
- **Todos flow**: slot-driven cache (`/todos/1`, `/todos/2`) backed by `https://dummyjson.com/todos/random`

## Stack

- Nuxt 4 + Vue 3
- Pinia
- XState v5 + `@xstate/vue`
- Nuxt UI

## Setup

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm dev
```

Available scripts:

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
```

## VS Code Extension (Recommended)

Install the XState visualizer extension for better machine authoring and inspection:

- Extension: **Stately for VS Code**
- Marketplace ID: `statelyai.stately-vscode`

You can install it from the VS Code Extensions panel by searching for `statelyai.stately-vscode`.

## Routes

- `/` quick links to user and todos demo routes
- `/user/:id` user detail/caching flow (examples: `/user/1`, `/user/2`)
- `/todos/:slot` todos slot flow where `slot` is `1` or `2`

## How Caching Works

### Users (`/user/:id`)

- Cache key: `userId`
- First visit to a user ID: fetch from API and store in Pinia
- Revisiting same user ID: serve from cache immediately
- Optional `FORCE_FETCH` path exists in the user machine to bypass cache

### Todos (`/todos/1` and `/todos/2`)

- Cache key: slot (`1` or `2`)
- Data source: always `https://dummyjson.com/todos/random`
- First visit to slot: immediate fetch and store under that slot
- Revisiting slot:
  - cached todo is shown immediately
  - machine enters refresh mode and waits **5 seconds**
  - after delay, calls API and updates the same slot with latest data

This is a stale-while-revalidate style UX with intentional delayed revalidation for the todos flow.

## Key Files

- Home page: `app/pages/index.vue`
- User page: `app/pages/user/[id].vue`
- Todos page: `app/pages/todos/[slot].vue`
- User machine: `app/machines/apiMachine.ts`
- Todos machine: `app/machines/todoMachine.ts`
- User store: `app/stores/apiData.ts`
- Todos store: `app/stores/todoData.ts`

## Notes

- Todos route only supports slot `1` or `2`; invalid slot shows an error state.
- Request counters and last fetch timestamps are tracked in stores for visibility/debugging.
