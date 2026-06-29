# ConditionalTermsModule

An example quote module that demonstrates **conditionally including content on a quote based on the line items it contains**.

## What it demonstrates

The module renders a `Terms & Conditions` block made up of several sections. A `General` section is always shown; the rest of the sections are conditional on what's on the quote:

| Section               | Shown when                                       | Driven by                            |
| --------------------- | ------------------------------------------------ | ------------------------------------ |
| General               | Always                                           | —                                    |
| One-Time Purchases    | Any line item is non-recurring                   | `recurringbillingfrequency` is empty |
| Subscriptions         | Any line item is recurring                       | `recurringbillingfrequency` is set   |
| Delayed Billing Start | Any line item has a delayed/future billing start | `hs_billing_start_delay_type` is set |

Both `recurringbillingfrequency` and `hs_billing_start_delay_type` are default line-item properties — they're filled in when a sales rep configures billing on the line item, and that's what the section conditions read.

Sections live as keyed entries on the `SECTIONS` object in [`termsData.ts`](./termsData.ts) (`General`, `OneTime`, `Subscriptions`, `DelayedStartDate`). The component in [`index.tsx`](./index.tsx) computes a `showOneTime` / `showSubscriptions` / `showDelayedStartDate` boolean from the line items and spreads the matching entries into the render list.

## Files

| File                             | Responsibility                                                              |
| -------------------------------- | -------------------------------------------------------------------------- |
| [`index.tsx`](./index.tsx)       | The `Component`, the conditional logic, `meta`, and `hublDataTemplate`.     |
| [`fields.tsx`](./fields.tsx)     | The editor `fields` (heading, intro, background color) and `FieldValues`.  |
| [`termsData.ts`](./termsData.ts) | The section/clause copy as plain data.                                      |

## Why the clause text is hardcoded

The actual clause text lives in [`termsData.ts`](./termsData.ts), **not** in module fields. The only fields the quote editor exposes are cosmetic: a heading, an optional intro, and a background color.

This is intentional: when terms are vetted by legal/ops, you usually don't want sales reps editing them per-quote. Hardcoding the language in the module:

- Prevents accidental edits, reorders, or deletions of legal-approved language.
- Lets legal/ops update terms in code (one change, reflected on every quote that hasn't been published yet) instead of chasing edits across templates.
- Keeps quotes consistent — every quote with subscriptions gets exactly the same subscription terms.

## Making the terms editable instead

If you do want sales reps to be able to override the language per-quote, lift the clause arrays into module fields. The pattern would be a `RepeaterField` of `{ title, body }` per group, with the current hardcoded values supplied as field defaults. Add the new field definitions to [`fields.tsx`](./fields.tsx) (and the matching shape to `FieldValues`), then read them off `fieldValues` instead of importing them from `termsData.ts`.

## Sourcing the clause text from elsewhere

Hardcoding in `termsData.ts` is just one option. The clause text is plain data that the component maps over, so the source of truth can live elsewhere. For the first two options below you fetch the data in the `hublDataTemplate` and add it to `hublData` (the same channel `lineItems` already flows through), then iterate over that instead of the imported `SECTIONS`; the external option fetches it client-side instead. Either way, the conditional logic in [`index.tsx`](./index.tsx) doesn't change — only where the data comes from does.

- **HubDB** — Put each clause in a HubDB table (one row per clause, with `section`, `title`, and `body` columns) so legal/ops can edit terms in the HubSpot UI without a code change. Query it from the `hublDataTemplate` with `hubdb_table_rows()`, group the rows by section, and add the result to `hublData`. Note that HubDB (and `hubdb_table_rows()`) requires **Content Hub Professional or Enterprise, or Marketing Hub Enterprise**.
- **CRM custom properties** — Store the text in custom properties on a CRM record and read them with `crm_object()` in the `hublDataTemplate` (`QuoteExampleModule` shows the `crm_object()` pattern). Custom properties on standard objects such as the quote or deal are available on any tier that includes those objects. `crm_object()` can also query a **custom object** — pass its object type ID or fully-qualified name (`p<portalId>_<name>`) as the object type — but custom objects themselves require an **Enterprise** subscription (Sales, Marketing, Service, Operations, or Content Hub Enterprise).
- **An external data source** — Fetch the terms from your own API. The rendering context only exposes HubSpot-native data, so this one happens client-side: render a hydrated `<Island>` (see `QuoteExampleModule`) that calls your endpoint from the buyer's browser. Unlike the HubDB and CRM options — which resolve server-side and are baked into the published quote's locked HTML — an external fetch runs at view time, so the terms shown can change after the quote is published. Worth weighing for legal text that's meant to be fixed once the quote is sent.

## Extending the conditions

To add a new section: add a key to `SECTIONS` in [`termsData.ts`](./termsData.ts) with its `label` and `clauses`, then add a matching `show<Name>` boolean and spread in the Component in [`index.tsx`](./index.tsx).

Other default line item properties worth branching on:

- `hs_term_in_months` — fixed-length contract commitments
- `hs_discount_percentage` / `hs_total_discount` — promotional or discount-specific clauses
