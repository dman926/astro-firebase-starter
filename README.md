# Astro Supabase Starter

## Packages

| Package                                    | Description                                                         |
| :----------------------------------------- | :------------------------------------------------------------------ |
| [data-grabbers](./data-grabbers/README.md) | Fetches static content from Firebase for Astro Content Collections. |
| [frontend](./frontend/README.md)           | The main website. Created with Astro.                               |
| [shared](./shared/README.md)               | Shared types and functionality.                                     |

## Get Started

Clone the repo.

Be sure you have [pnpm installed](https://pnpm.io/feature-comparison) as this is used in place of npm for the [benefits noted](https://pnpm.io/feature-comparison).

From the terminal

```shell
$ pnpm install
$ pnpm --filter shared build:install

# Start the API
$ pnpm --filter api start

# Start the Frontend dev server
$ pnpm --filter frontend dev
```

Be sure to make a copy of `api/.env.sample` to `api/.env` and fill out the values.

```shell
$ cp api/.env.sample api/.env
$ code api/.env
```

As of Nov 27, 2023, the next steps are a WIP to be clarified and added.
