import {
  ModuleFields,
  TextField,
  RichTextField,
  FieldGroup,
  ColorField,
} from '@hubspot/cms-components/fields';

export interface FieldValues {
  heading: string;
  intro?: string;
  styles?: {
    backgroundColor?: { css: string };
  };
}

export const fields = (
  <ModuleFields>
    <TextField name="heading" label="Heading" default="Terms & Conditions" />
    <RichTextField
      name="intro"
      label="Intro"
      default="<p>The following terms and conditions apply to this quote. Sections are included automatically based on the products and billing terms it contains.</p>"
    />
    <FieldGroup name="styles" label="Styles" tab="STYLE">
      <ColorField name="backgroundColor" label="Background Color" />
    </FieldGroup>
  </ModuleFields>
);
