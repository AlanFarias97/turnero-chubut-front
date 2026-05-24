export type VehicleStatus =
  | 'WAITING'
  | 'IN_BAY'
  | 'COMPLETED';

export interface Vehicle {

  id: number;

  patent: string;

  service: string;

  waitingMinutes: number;

  status: VehicleStatus;

  ticketNumber: number;

  createdAt: Date;

  description: string;

  assignedOperators?: string[];

}
