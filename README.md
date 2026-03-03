# Nuxt Starter Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to get started with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://starter-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://starter-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
    <img alt="Nuxt Starter Template" src="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png" width="830" height="466">
  </picture>
</a>

> The starter template for Vue is on https://github.com/nuxt-ui-templates/starter-vue.

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/starter
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Learning Example: Pinia + XState

This workspace now includes a simple learning example on `/` using your API:

- API: `https://mp13670615701467ec74.free.beeceptor.com`
- XState handles the request lifecycle (`idle -> loading -> success/failure`)
- Pinia stores the fetched data so any page/component can reuse it

### Files

- Store: `app/stores/apiData.ts`
- State machine: `app/machines/apiMachine.ts`
- Page UI: `app/pages/index.vue`

### Why this pattern is useful

- Use **XState** for flow logic (what happens next and when)
- Use **Pinia** for shared app state (what data your app keeps)
- In larger projects, this keeps side-effects and transitions predictable while preserving a single source of truth for data

### Suggested structure for larger apps

- `app/stores/*` for domain stores (`user`, `orders`, `settings`)
- `app/machines/*` for workflows (`checkoutMachine`, `authMachine`)
- `app/services/*` for API clients (plain fetch functions)
- `app/composables/*` for reusable glue code between stores and machines

When this starts growing, move API calls out of machine files into `services` and inject them into machines for easier testing.
