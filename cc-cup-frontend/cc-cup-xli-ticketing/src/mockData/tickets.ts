import { TicketTier } from '@/types';

export const ticketTiers: TicketTier[] = [
  {
    id: 'regular',
    type: 'regular',
    name: 'Regular',
    price: 75000,
    description: 'General admission access to the event.',
    benefits: ['Event access', 'Welcome kit', 'Snack box'],
    available: 200,
  },
  {
    id: 'vip',
    type: 'vip',
    name: 'VIP',
    price: 150000,
    description: 'Priority seating with exclusive perks.',
    benefits: ['Priority seating', 'VIP lounge access', 'Exclusive merch', 'Snack box'],
    available: 50,
  },
  {
    id: 'vvip',
    type: 'vvip',
    name: 'VVIP',
    price: 300000,
    description: 'The ultimate experience with backstage access.',
    benefits: ['Front-row seating', 'Backstage access', 'Meet & greet', 'Full merch bundle', 'Premium catering'],
    available: 20,
  },
];
