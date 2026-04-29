# quote-dev-starter

A starter project for building **custom-coded React modules** for [HubSpot Commerce Hub](https://www.hubspot.com/products/commerce) quote templates.

This repo gives you a working example you can fork or copy: a typed React module that pulls quote and CRM data from HubL and hydrates an interactive island on the client.

## What's in here

```
src/cms-assets/my-react-assets/
└── components/modules/QuoteExampleModule/
    ├── index.tsx                       # Module entry: fields, hublDataTemplate, Component
    └── islands/InteractiveButton.tsx   # Client-hydrated island
```

The example module demonstrates:

- **Typed `hublData` and `fieldValues`** — using [`@hubspot/quote-dev-sdk`](https://www.npmjs.com/package/@hubspot/quote-dev-sdk) for compile-time safety against the `quoteTemplateContext` shape.
- **HubL CRM querying** — calling `crm_object()` from the module's `hublDataTemplate` to fetch company data on the server.
- **Editor detection** — rendering a non-interactive placeholder when `is_in_editor`, and an `<Island>` when published.

## Prerequisites

- Node.js 20+
- The [HubSpot CLI](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli) (`npm install -g @hubspot/cli`) authenticated against the portal you want to deploy to (`hs auth`).

## Local development

```sh
npm install
npm start
```

`npm install` installs both root and `src/cms-assets/my-react-assets/` dependencies (the inner install runs as a `postinstall` step). `npm start` boots `hs-cms-dev-server` from the React assets directory and serves a local preview of the module.

## Deploy to a portal

```sh
npm run deploy
```

This calls `hs project upload` on the configured portal.

## Documentation

- [CMS React + HubL overview](https://developers.hubspot.com/docs/cms/start-building/introduction/react-plus-hubl/overview)
- [`@hubspot/quote-dev-sdk` README](https://github.com/HubSpot/quote-dev-sdk) — type reference and patterns
- [`@hubspot/cms-components`](https://www.npmjs.com/package/@hubspot/cms-components) — fields, `<Island>`, and other primitives

## License

MIT — see [`LICENSE`](./LICENSE).
