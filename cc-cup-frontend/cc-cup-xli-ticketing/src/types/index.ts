export interface Ticket {
  id: string;
  nik: string;
  fullName: string;
  email: string;
  status: 'paid' | 'pending';
  redeemedAt?: string;
  scannedBy?: string;
  terminal?: string;
  isRedeemed: boolean;
}

export interface ScannerResult {
  success: boolean;
  ticket?: Ticket;
  error?: 'ALREADY_REDEEMED' | 'INVALID_TICKET' | 'NETWORK_ERROR';
}
