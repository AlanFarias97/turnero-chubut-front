export type VehicleStatus =
  | 'in_queue'
  | 'in_progress'
  | 'completed'
  | 'partial_completed'
  | 'not_completed';

export type VehiclePaymentStatus =
  | 'unpaid'
  | 'partial'
  | 'paid';

export interface Vehicle {

  id: number;

  patent: string;

  service: string;

  waitingMinutes: number;

  status: VehicleStatus;

  paymentStatus: VehiclePaymentStatus;

  ticketNumber: number;

  createdAt: Date;

  description: string;

  assignedOperators?: string[];

  pendingWorkDetail?: string;

}
