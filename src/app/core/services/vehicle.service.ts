import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import {
  environment
} from 'src/environments/environment';

import {
  Bay
} from 'src/app/features/dashboard/models/bay';

import {
  Vehicle,
  VehiclePaymentStatus,
  VehicleStatus
} from 'src/app/features/dashboard/models/vehicle';

export interface DashboardState {
  bays: Bay[];
  waitingVehicles: Vehicle[];
  completedVehicles: Vehicle[];
  nextTicketNumber: number;
}

export interface VehicleRequest {
  patent: string;
  description: string;
  service: string;
  paymentStatus: VehiclePaymentStatus;
  assignedOperators?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/vehicles`;

  getDashboardState(): Observable<DashboardState> {

    return this.http
      .get<DashboardState>(
        `${this.apiUrl}/dashboard`
      )
      .pipe(
        map(state =>
          this.normalizeDashboardState(state)
        )
      );

  }

  createVehicle(
    request: VehicleRequest
  ): Observable<Vehicle> {

    return this.http
      .post<Vehicle>(
        this.apiUrl,
        request
      )
      .pipe(
        map(vehicle =>
          this.normalizeVehicle(vehicle)
        )
      );

  }

  updateVehicle(
    id: number,
    request: VehicleRequest
  ): Observable<Vehicle> {

    return this.http
      .put<Vehicle>(
        `${this.apiUrl}/${id}`,
        request
      )
      .pipe(
        map(vehicle =>
          this.normalizeVehicle(vehicle)
        )
      );

  }

  assignToBay(
    id: number,
    bayId: number,
    assignedOperators: string[]
  ): Observable<DashboardState> {

    return this.http
      .post<DashboardState>(
        `${this.apiUrl}/${id}/assign-to-bay`,
        {
          bayId,
          assignedOperators
        }
      )
      .pipe(
        map(state =>
          this.normalizeDashboardState(state)
        )
      );

  }

  moveToQueue(
    id: number
  ): Observable<DashboardState> {

    return this.http
      .post<DashboardState>(
        `${this.apiUrl}/${id}/move-to-queue`,
        {}
      )
      .pipe(
        map(state =>
          this.normalizeDashboardState(state)
        )
      );

  }

  completeVehicle(
    id: number,
    status: Extract<
      VehicleStatus,
      | 'completed'
      | 'partial_completed'
      | 'not_completed'
    >,
    pendingWorkDetail: string
  ): Observable<DashboardState> {

    return this.http
      .post<DashboardState>(
        `${this.apiUrl}/${id}/complete`,
        {
          status,
          pendingWorkDetail
        }
      )
      .pipe(
        map(state =>
          this.normalizeDashboardState(state)
        )
      );

  }

  private normalizeDashboardState(
    state: DashboardState
  ): DashboardState {

    return {
      bays: state.bays.map(bay => ({
        ...bay,
        currentVehicle: bay.currentVehicle
          ? this.normalizeVehicle(
              bay.currentVehicle
            )
          : null
      })),
      waitingVehicles:
        state.waitingVehicles.map(vehicle =>
          this.normalizeVehicle(vehicle)
        ),
      completedVehicles:
        state.completedVehicles.map(vehicle =>
          this.normalizeVehicle(vehicle)
        ),
      nextTicketNumber:
        state.nextTicketNumber
    };

  }

  private normalizeVehicle(
    vehicle: Vehicle
  ): Vehicle {

    return {
      ...vehicle,
      createdAt:
        new Date(vehicle.createdAt),
      boxStartedAt:
        vehicle.boxStartedAt
          ? new Date(vehicle.boxStartedAt)
          : undefined,
      boxTimerStartedAt:
        vehicle.boxTimerStartedAt
          ? new Date(vehicle.boxTimerStartedAt)
          : undefined,
      boxEndedAt:
        vehicle.boxEndedAt
          ? new Date(vehicle.boxEndedAt)
          : undefined,
      assignedOperators:
        vehicle.assignedOperators || [],
      boxElapsedMs:
        vehicle.boxElapsedMs || 0,
      paymentStatus:
        vehicle.paymentStatus || 'unpaid'
    };

  }
}
