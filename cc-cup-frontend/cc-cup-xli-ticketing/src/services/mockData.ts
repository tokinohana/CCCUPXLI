import type { Ticket } from "../types";

export const mockTickets: Ticket[] = [
  {
    id: "TX-8849-QR",
    nik: "3275012304910003",
    fullName: "ADITYA PRASETYA",
    email: "aditya@example.com",
    status: "paid",
    isRedeemed: true,
    redeemedAt: "2026-05-14T19:04:32Z",
    scannedBy: "KEVIN_OP_04",
    terminal: "ZONE_B_G3"
  },
  {
    id: "TX-1234-QR",
    nik: "3275012304910001",
    fullName: "BENEDICT",
    email: "benedict@example.com",
    status: "paid",
    isRedeemed: false
  },
  {
    id: "TX-5678-QR",
    nik: "3275012304910002",
    fullName: "SARAH J.",
    email: "sarah@example.com",
    status: "pending",
    isRedeemed: false
  }
];
