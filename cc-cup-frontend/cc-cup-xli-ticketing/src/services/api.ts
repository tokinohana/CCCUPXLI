import axios from "axios";
import type { Ticket, ScannerResult } from "../types";
import { mockTickets } from "./mockData";

const api = axios.create({
  baseURL: "/api",
});

// Mocking logic for demonstration
export const apiService = {
  getTickets: async (): Promise<Ticket[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTickets;
  },

  scanTicket: async (ticketId: string): Promise<ScannerResult> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const ticket = mockTickets.find(t => t.id === ticketId);
    
    if (!ticket) {
      return { success: false, error: 'INVALID_TICKET' };
    }
    
    if (ticket.isRedeemed) {
      return { success: false, ticket, error: 'ALREADY_REDEEMED' };
    }
    
    return { success: true, ticket };
  },

  createTicket: async (data: Partial<Ticket>): Promise<Ticket> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTicket: Ticket = {
      id: `TX-${Math.floor(Math.random() * 9000) + 1000}-QR`,
      nik: data.nik || "",
      fullName: data.fullName || "",
      email: data.email || "",
      status: data.status || "pending",
      isRedeemed: false,
    };
    mockTickets.push(newTicket);
    return newTicket;
  },

  verifyNIK: async (nik: string): Promise<{ exists: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const exists = mockTickets.some(t => t.nik === nik);
    return { exists };
  }
};

export default api;
