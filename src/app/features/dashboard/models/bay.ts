import { Vehicle } from './vehicle';

export interface Bay {

  id: number;

  name: string;

  currentVehicle?: Vehicle | null;

}
