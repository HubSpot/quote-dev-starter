# Custom Quote Modules for HubSpot CPQ

## Overview

This skill covers building custom React modules for HubSpot CPQ Quotes. The workflow enables rapid visual development with local preview before deploying to HubSpot.

The starter project lives at [HubSpot/quote-dev-starter](https://github.com/HubSpot/quote-dev-starter). Type definitions for `quoteTemplateContext` are published in [`@hubspot/quote-dev-sdk`](https://www.npmjs.com/package/@hubspot/quote-dev-sdk).

## Project Structure

```
├── hsproject.json                          # HubSpot project config
├── package.json                            # Root package (deploy scripts)
├── preview/
│   └── index.html                          # Local preview with mock data (not deployed)
├── .claude/
│   ├── launch.json                         # Dev server config for Claude Preview
│   └── skills/
│       └── quote-custom-modules-dev.md      # This file
└── src/cms-assets/my-react-assets/
    ├── package.json                        # React + @hubspot/cms-components deps
    ├── cms-assets.json                     # Asset bundle config
    ├── tsconfig.json                       # TypeScript config
    └── components/modules/
        └── <ModuleName>/
            ├── index.tsx                   # Module entry: Component, fields, meta, hublDataTemplate
            └── islands/
                └── <IslandName>.tsx        # Interactive client-side components
```

## Key Concepts

### Module Anatomy

Every module exports four things from `index.tsx`:

1. **`Component`** — React component receiving `{ fieldValues, hublData }`
2. **`fields`** — JSX defining editor sidebar fields (`TextField`, `ColorField`, `FieldGroup`, etc.)
3. **`meta`** — Module metadata. `content_types` MUST include `['QUOTE', 'QUOTE_BLUEPRINT']`
4. **`hublDataTemplate`** — HubL template string that passes server-side data to the component

Standard imports:

```tsx
import { ModuleFields, TextField, FieldGroup, ColorField } from '@hubspot/cms-components/fields';
import { Island } from '@hubspot/cms-components';
import type { QuoteTemplateContext } from '@hubspot/quote-dev-sdk';
```

### Typing with `@hubspot/quote-dev-sdk`

The SDK exports `QuoteTemplateContext` and its member types (`QuoteProperties`, `DealProperties`, `LineItemProperties`, `ContactProperties`, `CompanyProperties`, `SignerProperties`, `QuoteDocumentProperties`). Use them to type the `hublData` prop so autocomplete works and property-name typos become compile errors.

**Only pass the data the module actually uses.** Each module's `hublDataTemplate` should select specific fields from `quoteTemplateContext`, and its `HublData` interface should type exactly that shape. This keeps the HubL-to-React bridge lean, makes the component's data dependencies explicit, and gives TypeScript something meaningful to check.

```tsx
interface HublData {
  quote: Pick<QuoteTemplateContext['quote'], 'hs_title' | 'hs_currency'>;
  lineItems: QuoteTemplateContext['lineItems'];
}

export const hublDataTemplate = `
  {% set hublData = {
    "quote": {
      "hs_title": quoteTemplateContext.quote.hs_title,
      "hs_currency": quoteTemplateContext.quote.hs_currency
    },
    "lineItems": quoteTemplateContext.lineItems
  } %}
`;
```

Useful narrowing patterns:

```ts
import type { QuoteTemplateContext, LineItemProperties } from '@hubspot/quote-dev-sdk';

type LineItemsOnly = Pick<QuoteTemplateContext, 'lineItems'>;
type WithoutDocuments = Omit<QuoteTemplateContext, 'quoteDocuments'>;
type BillingFields = Pick<LineItemProperties, 'name' | 'amount' | 'hs_recurring_billing_period' | 'hs_term_in_months'>;
```

### quoteTemplateContext

The `quoteTemplateContext` HubL global provides all quote data. Its top-level shape:

```
quoteTemplateContext: {
  quote: QuoteProperties          — title, status, currency, amounts, sender info, dates, settings
  deal: DealProperties            — name, stage, amount, pipeline, close date
  lineItems: LineItemProperties[] — name, quantity, price, amount, SKU, billing terms, discounts
  buyerContacts: ContactProperties[]  — name, email, company, address
  buyerCompany: CompanyProperties     — name, domain, address
  billingContact: ContactProperties
  billingCompany: CompanyProperties
  quoteDocuments: QuoteDocumentProperties[]
  signers: SignerProperties[]     — firstName, lastName, email, avatarUrl
  counterSigners: SignerProperties[]
}
```

The full property list for each type is defined in `@hubspot/quote-dev-sdk`. Install it as a dev dependency and refer to the type definitions for the complete set of available fields. All CRM-object interfaces include an index signature (`[key: string]: CrmPropertyValue | undefined`) — properties beyond the typed surface may exist at runtime.

> **Note:** `buyerCompany` from `quoteTemplateContext` may be a sparse object. To get the full company record (including `hs_logo_url`), look it up in `hublDataTemplate` via `crm_object("company", quoteTemplateContext.buyerCompany.hs_object_id, "name,domain,hs_logo_url")`.

To enrich a record beyond what `quoteTemplateContext` exposes — including custom properties defined in the portal — use `crm_object()` or `crm_associations()` inside the HubL block:

```tsx
export const hublDataTemplate = `
  {% if quoteTemplateContext.buyerCompany.hs_object_id %}
    {% set companyDetails = crm_object("company", quoteTemplateContext.buyerCompany.hs_object_id, "name,domain,hs_logo_url") %}
  {% endif %}

  {% set hublData = {
    "quoteTitle": quoteTemplateContext.quote.hs_title,
    "companyName": companyDetails.name if companyDetails else null,
    "companyDomain": companyDetails.domain if companyDetails else null
  } %}
`;
```

### Islands Architecture

Modules are server-side rendered (SSR). For client-side interactivity, use Islands:

```tsx
// @ts-expect-error -- ?island not typed
import InteractiveComponent from './islands/MyComponent?island';
import MyComponent from './islands/MyComponent';

// In editor: render static version
// On published quote: render island with hydration
{isInEditor ? (
  <MyComponent {...props} />
) : (
  <Island module={InteractiveComponent} hydrateOn="load" {...props} />
)}
```

**Props passed to an `<Island>` are serialized onto the DOM.** Only pass scalar values and small objects that are directly relevant to the island's rendered output. Avoid passing entire `quoteTemplateContext` slices, large arrays, or objects with fields the island doesn't use — the data ends up in the HTML payload and inflates page weight for no benefit.

### Editor Detection and Template Fallbacks

Use HubL variables to detect editor/previewer context:

```
"isInEditor": is_in_editor,
"isQuoteBlueprint": isQuoteBlueprint
```

`is_in_editor` is important because Islands cause full-page reloads in the editor. Render static fallbacks in editor mode.

`isQuoteBlueprint` is `true` when the module renders inside a quote *template* rather than an individual quote. In that context, `quoteTemplateContext` contains no real data — buyer contacts, company, and line items will be empty or null. Modules should detect this and substitute sensible placeholder values so the template editor still shows a representative preview:

```tsx
const companyName = hublData.isQuoteBlueprint ? 'Acme Corp' : hublData.companyName;
const lineItems = hublData.isQuoteBlueprint ? PLACEHOLDER_LINE_ITEMS : hublData.lineItems;
```

## Development Workflow

### Building a New Quote from a Screenshot (primary workflow)

The user provides a screenshot of the target design. Build **both** `preview/index.html` and `<ModuleName>/index.tsx` in a single pass — do NOT build the preview first and port later.

#### Step-by-step:

1. **Analyze the screenshot** — identify layout sections, colors, typography, spacing, and content
2. **Create mock data** matching the screenshot content (company names, line items, amounts, contacts)
3. **Write `preview/index.html`** — standalone HTML with React CDN + Babel standalone + mock data
4. **Write `components/modules/<ModuleName>/index.tsx`** — the real module using the same component structure, typed with `@hubspot/quote-dev-sdk`
5. **Start preview server** — `python3 -m http.server 3456 -d preview` (or use `.claude/launch.json`)
6. **Iterate** — user reviews preview, requests tweaks, update both files

#### Preview HTML template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const MOCK_DATA = { /* ... */ };
    // Components here — same structure as the TSX module
    function App() { /* ... */ }
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

#### Styling

All styles should be inline React `style` objects — do not use CSS files. Load fonts via `@import` or `<link>` in the preview HTML. Use the `useContainerWidth()` hook for responsive layouts.

### Preview with Claude Preview

The `.claude/launch.json` should be configured to serve the preview directory:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "preview",
      "runtimeExecutable": "python3",
      "runtimeArgs": ["-m", "http.server", "3456", "-d", "preview"],
      "port": 3456
    }
  ]
}
```

If Claude Preview tools are available, use them to iterate visually:
- `mcp__Claude_Preview__preview_start` — Start the preview server
- `mcp__Claude_Preview__preview_screenshot` — Capture the current state
- `mcp__Claude_Preview__preview_resize` — Test responsive layouts (desktop, tablet, mobile)
- `mcp__Claude_Preview__preview_eval` — Debug DOM state, scroll, reload
- `mcp__Claude_Preview__preview_snapshot` — Get accessibility tree for text verification

If Claude Preview tools are NOT available, start the server manually:
```bash
python3 -m http.server 3456 -d preview &
```
Then tell the user to open http://localhost:3456 in their browser.

The `preview/index.html` is a scratch file — it gets overwritten for whichever module is actively being worked on.

### Local Dev Server

The starter project includes `hs-cms-dev-server` for local development against real HubSpot rendering:

```bash
npm start
```

This boots the CMS dev server from the React assets directory and serves a local preview of the module with HubL evaluation. Use this to verify `hublDataTemplate` behavior before deploying.

### Make It Responsive

Use a `ResizeObserver`-based hook to measure container width (not viewport width — the module may be embedded in a narrower container):

```tsx
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    setWidth(ref.current.offsetWidth);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
```

Pass `compact` (e.g., `width < 700`) to all sub-components and adjust:
- 2-col grids → 1-col
- 4-col grids → 2-col
- Tables → horizontal scroll with `overflowX: 'auto'`
- Smaller font sizes and padding

Test with `preview_resize` using `preset: "mobile"` and `preset: "desktop"`.

### Deploy

```bash
npm run deploy
```

This runs `hs project upload`, which builds and auto-deploys to the HubSpot portal. The module becomes available in the quote template editor.

## Requirements & Constraints

- Requires a Commerce Hub Professional or Enterprise account
- Project name cannot be `cpq-theme`
- Module `content_types` must include `QUOTE` and `QUOTE_BLUEPRINT`
- Modules must be React (classic HubL modules are not supported)
- Island interactivity should not render in the editor — use `is_in_editor` to conditionally render static fallbacks
- New module versions apply to future quotes and unpublished drafts, but not to already-published quotes
- Deleting or removing a module from the project removes it from unpublished quotes and templates; published quotes are unaffected

## Starter Module

The starter project ships with `QuoteExampleModule` as a minimal reference for module structure (`Component`, `fields`, `meta`, `hublDataTemplate`) and SDK typing. Use it as a scaffold when creating a new module — copy the directory, rename, and replace the contents.

Each brand/client should get its own module directory under `components/modules/`.

## Common Mistakes

- **Don't use CSS files.** All styles should be inline React `style` objects.
- **Don't render Island interactivity in the editor.** Check `is_in_editor` and render a static fallback instead — Islands cause full-page reloads in editor context.
- **Don't pass whole objects or arrays to Islands.** Island props are serialized onto the DOM. Pass only the scalar values and small objects the island actually renders.
- **Don't forward the entire `quoteTemplateContext`.** Each module's `hublDataTemplate` should select only the fields the component uses. Type the `HublData` interface to match.
- **Don't forget `isQuoteBlueprint` fallbacks.** When rendering in a quote template, `quoteTemplateContext` has no real data. Substitute placeholder values so the template editor shows a representative preview.
- **Don't skip the `@ts-expect-error` on `?island` imports.** TypeScript doesn't understand the `?island` query suffix without an explicit module declaration.
