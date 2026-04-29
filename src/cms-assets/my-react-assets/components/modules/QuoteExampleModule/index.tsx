import { ModuleFields, TextField, FieldGroup, ColorField } from '@hubspot/cms-components/fields';
import { Island } from '@hubspot/cms-components';
import type { QuoteTemplateContext } from '@hubspot/quote-dev-sdk';
// @ts-expect-error -- ?island not typed
import InteractiveButton from './islands/InteractiveButton?island';
import InteractiveButtonComponent from './islands/InteractiveButton';

interface FieldValues {
  heading: string;
  buttonLabel: string;
  styles?: {
    backgroundColor?: { css: string };
    headingColor?: { css: string };
  };
}

interface HublData {
  quoteTitle?: QuoteTemplateContext['quote']['hs_title'];
  isQuoteBlueprint: boolean;
  isInEditor: boolean;
  companyName?: string;
  companyDomain?: string;
}

interface Props {
  fieldValues: FieldValues;
  hublData: HublData;
}

export function Component({ fieldValues, hublData }: Props) {
  const {
    quoteTitle,
    isQuoteBlueprint,
    companyDomain: rawCompanyDomain,
    companyName: rawCompanyName,
    isInEditor,
  } = hublData;

  const companyName = isQuoteBlueprint ? 'HubSpot' : rawCompanyName;
  const companyDomain = isQuoteBlueprint ? 'hubspot.com' : rawCompanyDomain;

  return (
    <div
      style={{
        backgroundColor: fieldValues.styles?.backgroundColor?.css,
        padding: 'calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 4)',
      }}
    >
      <h1 style={{ color: fieldValues.styles?.headingColor?.css }}>{fieldValues.heading}</h1>
      <p>Quote: {quoteTitle || 'Sample quote name'}</p>
      {companyName ? (
        <p>
          Company: {companyName}
          {companyDomain && ` (${companyDomain})`}
        </p>
      ) : (
        <p>No company associated with this quote.</p>
      )}
      {isInEditor ? (
        <>
          <InteractiveButtonComponent buttonLabel={fieldValues.buttonLabel} />
          <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
            This button will not be interactive until the quote is published.
          </p>
        </>
      ) : (
        <Island module={InteractiveButton} hydrateOn="load" buttonLabel={fieldValues.buttonLabel} />
      )}
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <TextField name="heading" label="Heading" default="Hello, World!" />
    <TextField name="buttonLabel" label="Button Label" default="Click me!" />
    <FieldGroup name="styles" label="Styles" tab="STYLE">
      <ColorField name="backgroundColor" label="Background Color" />
      <ColorField name="headingColor" label="Heading Color" />
    </FieldGroup>
  </ModuleFields>
);

export const meta = {
  label: 'Quote Example Module',
  content_types: ['QUOTE', 'QUOTE_BLUEPRINT'],
};

export const hublDataTemplate = `
  {# quoteTemplateContext.buyerCompany is already available in the quote template context, but we use
     crm_object() here as an example of querying CRM data via HubL #}
  {% if quoteTemplateContext.buyerCompany.hs_object_id %}
    {% set companyDetails = crm_object("company", quoteTemplateContext.buyerCompany.hs_object_id, "name,domain") %}
  {% endif %}

  {% set hublData = {
    "quoteTitle": quoteTemplateContext.quote.hs_title,
    "isQuoteBlueprint": isQuoteBlueprint,
    "isInEditor": is_in_editor,
    "companyName": companyDetails.name if companyDetails else null,
    "companyDomain": companyDetails.domain if companyDetails else null
  } %}
`;
