export interface Ticket {
  ticket_id: string;
  full_name: string;
  email: string;
  identification_number: string;
  status: 'pending' | 'paid' | 'voided';
  is_redeemed: boolean;
  redeemed_at: string | null;
  terminal: string | null;
  scanned_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateTicketPayload {
  full_name: string;
  email: string;
  identification_number: string;
}

export interface RedeemPayload {
  terminal: string;
}

export interface RedeemResponse {
  success: boolean;
  ticket?: Ticket;
  error?: 'ALREADY_REDEEMED' | 'INVALID_TICKET' | 'UNPAID_TICKET' | 'NETWORK_ERROR';
  message?: string;
}

export interface ScannerResult {
  success: boolean;
  ticket?: Ticket;
  error?: 'ALREADY_REDEEMED' | 'INVALID_TICKET' | 'UNPAID_TICKET' | 'NETWORK_ERROR';
  message?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface TicketListParams {
  status?: string;
  is_redeemed?: string;
  terminal?: string;
}
