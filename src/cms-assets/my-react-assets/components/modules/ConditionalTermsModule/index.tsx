import { RichTextFieldWrapper } from '@hubspot/cms-components';
import type { QuoteTemplateContext } from '@hubspot/quote-dev-sdk';

import { SECTIONS, type Clause } from './termsData';
import type { FieldValues } from './fields';

export { fields } from './fields';

interface HublData {
  lineItems: QuoteTemplateContext['lineItems'];
  isQuoteBlueprint: boolean;
}

interface Props {
  fieldValues: FieldValues;
  hublData: HublData;
}

function ClauseItem({ clause }: { clause: Clause }) {
  return (
    <div style={{ marginBottom: 'calc(var(--spacing-unit) * 1.5)' }}>
      <h4 style={{ margin: '0 0 calc(var(--spacing-unit) * 0.5) 0' }}>
        {clause.title}
      </h4>
      <p style={{ margin: 0 }}>{clause.body}</p>
    </div>
  );
}

function SectionBlock({ label, clauses }: { label: string; clauses: Clause[] }) {
  return (
    <section style={{ marginBottom: 'calc(var(--spacing-unit) * 3)' }}>
      <h3
        style={{
          margin: '0 0 calc(var(--spacing-unit) * 1.5) 0',
          paddingBottom: 'calc(var(--spacing-unit) * 0.5)',
          borderBottom: '1px solid currentColor',
          fontSize: '1.15em',
        }}
      >
        {label}
      </h3>
      {clauses.map((clause) => (
        <ClauseItem key={clause.title} clause={clause} />
      ))}
    </section>
  );
}

export function Component({ fieldValues, hublData }: Props) {
  const { lineItems, isQuoteBlueprint } = hublData;
  const items = lineItems ?? [];

  const showAll = isQuoteBlueprint;
  const showOneTime = showAll || items.some((i) => !i.recurringbillingfrequency);
  const showSubscriptions =
    showAll || items.some((i) => Boolean(i.recurringbillingfrequency));
  const showDelayedStartDate =
    showAll || items.some((i) => Boolean(i.hs_billing_start_delay_type));

  const visibleSections = [
    SECTIONS.General,
    ...(showOneTime ? [SECTIONS.OneTime] : []),
    ...(showSubscriptions ? [SECTIONS.Subscriptions] : []),
    ...(showDelayedStartDate ? [SECTIONS.DelayedStartDate] : []),
  ];

  return (
    <div
      style={{
        backgroundColor: fieldValues.styles?.backgroundColor?.css,
        padding: 'calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 4)',
        lineHeight: 1.55,
      }}
    >
      <h2 style={{ margin: '0 0 calc(var(--spacing-unit) * 2) 0' }}>
        {fieldValues.heading}
      </h2>

      {fieldValues.intro ? (
        <RichTextFieldWrapper
          tag="div"
          fieldValue={fieldValues.intro}
          style={{ marginBottom: 'calc(var(--spacing-unit) * 3)' }}
        />
      ) : null}

      {visibleSections.map((section) => (
        <SectionBlock
          key={section.label}
          label={section.label}
          clauses={section.clauses}
        />
      ))}
    </div>
  );
}

export const meta = {
  label: 'Conditional Terms',
  content_types: ['QUOTE', 'QUOTE_BLUEPRINT'],
};

export const hublDataTemplate = `
  {% set hublData = {
    "lineItems": quoteTemplateContext.lineItems,
    "isQuoteBlueprint": isQuoteBlueprint
  } %}
`;
