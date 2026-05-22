export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface OptionalAddon {
  id: string;
  description: string;
  unitPrice: number;
}

export interface QuoteData {
  token: string;
  contactId: string;
  opportunityId?: string;
  locationId: string;
  businessName: string;
  businessLogo?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  quoteTitle: string;
  quoteDate: string;
  expiryDate: string;
  lineItems: LineItem[];
  optionalAddons: OptionalAddon[];
  taxRate: number;
  depositPercent: number;
  terms: string;
  status: "draft" | "sent" | "approved" | "expired";
  selectedAddons: string[];
  signature?: string;
  approvedAt?: string;
  createdAt: string;
}
