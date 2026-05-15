export type VehicleStatus =
  | 'WAITING'
  | 'IN_BAY'
  | 'COMPLETED';

export interface Vehicle {

  id: number;

  patent: string;

  brand: string;

  model: string;

  color: string;

  service: string;

  waitingMinutes: number;

  status: VehicleStatus;

  ticketNumber: number;

  createdAt: Date;

  assignedOperators?: string[];

}
