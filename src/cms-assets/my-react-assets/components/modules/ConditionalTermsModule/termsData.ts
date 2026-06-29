export interface Clause {
  title: string;
  body: string;
}

export interface TermsSection {
  label: string;
  clauses: Clause[];
}

// Example placeholder copy — replace with legal-approved language for production use.
export const SECTIONS = {
  General: {
    label: "General",
    clauses: [
      {
        title: "Payment",
        body: "All fees are due net 30 days from the invoice date unless otherwise stated. Late payments may accrue interest at 1.5% per month or the maximum permitted by law, whichever is lower.",
      },
      {
        title: "Taxes",
        body: "Fees are exclusive of all applicable taxes. Customer is responsible for any sales, use, value-added, or similar taxes assessed on the transaction, excluding taxes based on the supplier’s net income.",
      },
      {
        title: "Limitation of Liability",
        body: "To the maximum extent permitted by law, neither party’s aggregate liability arising out of or related to this agreement will exceed the amounts paid by Customer in the twelve months preceding the event giving rise to the claim.",
      },
      {
        title: "Governing Law",
        body: "This agreement is governed by the laws of the jurisdiction in which the supplier’s principal place of business is located, without regard to its conflict-of-laws principles.",
      },
    ],
  },
  OneTime: {
    label: "One-Time Purchases",
    clauses: [
      {
        title: "Delivery & Acceptance",
        body: "Physical goods will be delivered to the address specified on this quote. Customer must inspect delivered goods within 10 business days of receipt and notify the supplier of any visible defects or shortages in writing.",
      },
      {
        title: "Returns & Refunds",
        body: "Eligible one-time purchases may be returned within 30 days of delivery for a refund of the purchase price, less any applicable restocking or return-shipping fees. Custom or made-to-order items are non-refundable.",
      },
      {
        title: "Warranty",
        body: "One-time purchases are warranted against defects in materials and workmanship for 90 days from delivery. The supplier’s sole obligation under this warranty is, at its option, to repair or replace the affected item.",
      },
    ],
  },
  Subscriptions: {
    label: "Subscriptions",
    clauses: [
      {
        title: "Subscription Term & Auto-Renewal",
        body: "Subscriptions begin on the start date listed on this quote and continue for the term specified. Unless either party provides written notice of non-renewal at least 30 days before the end of the then-current term, subscriptions automatically renew for successive terms of equal length.",
      },
      {
        title: "Cancellation",
        body: "Customer may cancel a subscription at any time effective at the end of the then-current billing period. Fees already paid for the current period are non-refundable.",
      },
      {
        title: "Price Changes at Renewal",
        body: "The supplier may adjust subscription pricing at renewal by providing written notice at least 60 days before the renewal date. If Customer does not accept the new pricing, Customer may decline to renew with effect at the end of the current term.",
      },
      {
        title: "Service Availability",
        body: "The supplier will use commercially reasonable efforts to make subscription services available 24/7, excluding scheduled maintenance and circumstances beyond its reasonable control.",
      },
    ],
  },
  DelayedStartDate: {
    label: "Delayed Billing Start",
    clauses: [
      {
        title: "Service Start Date",
        body: "Where a line item specifies a future billing start, no fees will accrue and no services will be provided under that line item until the specified start date. The agreement otherwise takes effect on the signature date.",
      },
      {
        title: "Trial & Conversion",
        body: "If a line item includes a trial or evaluation period before billing begins, Customer may terminate that line item before the paid term begins by providing written notice. At the end of the trial period, the line item will automatically convert to a paid subscription at the rates shown on this quote unless Customer has terminated.",
      },
    ],
  },
} satisfies Record<string, TermsSection>;
