import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';

import { BayCardComponent }
from '../../components/bay-card/bay-card.component';

import { WaitingListComponent }
from '../../components/waiting-list/waiting-list.component';

import { Vehicle }
from '../../models/vehicle';

import { WorkshopStateService }
from 'src/app/core/services/workshop-state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    BayCardComponent,
    WaitingListComponent,
    FormsModule
  ]
})
export class DashboardPage
implements OnInit, OnDestroy {

  currentDate = new Date();

  clockInterval: any;

  nextTicketNumber = 4;

  showCreateVehicle = false;

  showAssignOperatorModal = false;

  selectedVehicleForBay: Vehicle | null = null;

  selectedBayId: number | null = null;

  selectedOperators: string[] = [];

  operators: string[] = [
    'Juan',
    'Martin',
    'Lucas',
    'Chino',
    'Gabi',
    'Beto'
  ];

  bays: any[] = [];

  waitingVehicles: Vehicle[] = [
    {
      id: 1,
      patent: 'AB123CD',
      brand: 'Toyota',
      model: 'Corolla',
      status: 'WAITING',
      color: 'Gris',
      service: 'Cambio x2 delanteras',
      waitingMinutes: 15,
      ticketNumber: 2,
      assignedOperators: [],
      createdAt: new Date()
    }
  ];

  completedVehicles: Vehicle[] = [];

  newVehicle = {

    patent: '',

    brand: '',

    model: '',

    color: '',

    service: ''

  };

  constructor(
    private workshopStateService:
    WorkshopStateService
  ) {}

  ngOnInit(): void {

    this.clockInterval =
      setInterval(() => {

        this.currentDate =
          new Date();

        this.updateWaitingTimes();

      }, 1000);

    this.workshopStateService
      .bays$
      .subscribe(bays => {

        this.bays = [...bays];

      });

  }

  ngOnDestroy(): void {

    clearInterval(
      this.clockInterval
    );

  }

  updateWaitingTimes(): void {

    const allVehicles = [

      ...this.waitingVehicles,

      ...this.completedVehicles,

      ...this.bays
        .filter(
          bay => bay.currentVehicle
        )
        .map(
          bay => bay.currentVehicle
        )

    ];

    allVehicles.forEach(vehicle => {

      const diffMs =
        new Date().getTime() -
        new Date(vehicle.createdAt)
          .getTime();

      vehicle.waitingMinutes =
        Math.floor(diffMs / 60000);

    });

  }

  onVehicleDropped(data: any): void {

    const draggedVehicle: Vehicle =
      data.event.item.data;

    const bay = this.bays.find(
      b => b.id === data.bayId
    );

    if (!bay) {
      return;
    }

    const previousContainerId =
      data.event.previousContainer.id;

    /*
     * SI VIENE DE OTRO BOX
     */
    if (
      previousContainerId.startsWith('bay-')
    ) {

      const previousBayId =
        Number(
          previousContainerId.replace(
            'bay-',
            ''
          )
        );

      const previousBay =
        this.bays.find(
          b => b.id === previousBayId
        );

      if (
        previousBay &&
        previousBay.currentVehicle
      ) {

        previousBay.currentVehicle =
          null;

      }

    }

    /*
     * SI EL BOX YA ESTÁ OCUPADO
     */
    if (bay.currentVehicle) {
      return;
    }

    this.selectedVehicleForBay =
      draggedVehicle;

    this.selectedBayId =
      bay.id;

    this.showAssignOperatorModal =
      true;

  }

  confirmAssignOperator(): void {

    if (
      !this.selectedVehicleForBay ||
      !this.selectedBayId
    ) {
      return;
    }

    const bay = this.bays.find(
      b => b.id === this.selectedBayId
    );

    if (!bay) {
      return;
    }

    this.selectedVehicleForBay
      .assignedOperators =
      [...this.selectedOperators];

    this.selectedVehicleForBay
      .status = 'IN_BAY';

    bay.currentVehicle =
      {
        ...this.selectedVehicleForBay
      };

    this.waitingVehicles =
      this.waitingVehicles.filter(
        vehicle =>
          vehicle.id !==
          this.selectedVehicleForBay?.id
      );

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

    this.showAssignOperatorModal =
      false;

    this.selectedVehicleForBay =
      null;

    this.selectedBayId =
      null;

    this.selectedOperators = [];

  }

  onVehicleReturned(
    event: any
  ): void {

    const previousContainerId =
      event.previousContainer.id;

    const bayId =
      Number(
        previousContainerId
          .replace('bay-', '')
      );

    const bay = this.bays.find(
      b => b.id === bayId
    );

    if (!bay) {
      return;
    }

    if (!bay.currentVehicle) {
      return;
    }

    bay.currentVehicle
      .assignedOperators = [];

    bay.currentVehicle.status =
      'WAITING';

    this.waitingVehicles.push(
      {
        ...bay.currentVehicle
      }
    );

    bay.currentVehicle = null;

    this.waitingVehicles.sort(
      (a, b) =>
        a.ticketNumber -
        b.ticketNumber
    );

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

  }

  onVehicleCompleted(
    bayId: number
  ): void {

    const bay = this.bays.find(
      b => b.id === bayId
    );

    if (!bay) {
      return;
    }

    if (!bay.currentVehicle) {
      return;
    }

    bay.currentVehicle.status =
      'COMPLETED';

    this.completedVehicles.unshift(
      {
        ...bay.currentVehicle
      }
    );

    bay.currentVehicle = null;

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

  }

  createVehicle(): void {

    const vehicle: Vehicle = {

      id: Date.now(),

      ticketNumber:
        this.nextTicketNumber,

      patent:
        this.newVehicle.patent,

      brand:
        this.newVehicle.brand,

      model:
        this.newVehicle.model,

      color:
        this.newVehicle.color,

      service:
        this.newVehicle.service,

      waitingMinutes: 0,

      createdAt: new Date(),

      status: 'WAITING',

      assignedOperators: []

    };

    this.waitingVehicles.push(
      vehicle
    );

    this.waitingVehicles.sort(
      (a, b) =>
        a.ticketNumber -
        b.ticketNumber
    );

    this.nextTicketNumber++;

    this.showCreateVehicle =
      false;

    this.newVehicle = {

      patent: '',

      brand: '',

      model: '',

      color: '',

      service: ''

    };

  }

  onOperatorToggle(
    operator: string,
    event: any
  ): void {

    if (event.target.checked) {

      this.selectedOperators.push(
        operator
      );

    } else {

      this.selectedOperators =
        this.selectedOperators.filter(
          op => op !== operator
        );

    }

  }
  onCompletedVehicleReturned(
    event: any
  ): void {

    const vehicle: Vehicle =
      event.item.data;

    this.completedVehicles =
      this.completedVehicles.filter(
        v => v.id !== vehicle.id
      );

    vehicle.status = 'WAITING';

    this.waitingVehicles.push(
      {
        ...vehicle
      }
    );

    this.waitingVehicles.sort(
      (a, b) =>
        a.ticketNumber -
        b.ticketNumber
    );

  }
}
