export declare const MAINSTAY_API_URL: string;
export declare const MAINSTAY_TENANT_SLUG: string;

export interface ContactInquiryPayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  role?: string | null;
  title?: string | null;
  message?: string | null;
  notes?: string | null;
  subject?: string | null;
  status?: 'lead' | 'active' | 'inactive' | 'customer';
  extra_field?: Record<string, any>;
  [key: string]: any;
}

export interface ContactInquiryResult {
  success: boolean;
  data?: any;
  error?: string;
}

export declare function submitContactInquiry(
  payload: ContactInquiryPayload
): Promise<ContactInquiryResult>;
