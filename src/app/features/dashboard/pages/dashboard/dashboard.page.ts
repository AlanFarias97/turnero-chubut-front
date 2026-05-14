import { Component,  OnInit,
  OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BayCardComponent } from '../../components/bay-card/bay-card.component';
import { WaitingListComponent } from '../../components/waiting-list/waiting-list.component';
import { Vehicle } from '../../models/vehicle';
import { Bay } from '../../models/bay';
import { FormsModule } from '@angular/forms';

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
export class DashboardPage implements OnInit, OnDestroy {

  currentDate = new Date();
  nextTicketNumber = 4;
  showCreateVehicle = false;
  clockInterval: any;
  ngOnInit() {

    this.clockInterval = setInterval(() => {

      this.currentDate = new Date();

      this.updateWaitingTimes();

    }, 1000);

  }
  ngOnDestroy() {

    clearInterval(
      this.clockInterval
    );

  }

  newVehicle = {

    patent: '',

    brand: '',

    model: '',

    color: '',

    service: ''

  };
  bays: Bay[] = [

    {
      id: 1,
      name: 'BAHÍA 1',
      currentVehicle: null
    },

    {
      id: 2,
      name: 'BAHÍA 2',
      currentVehicle: {
        id: 4,
        patent: 'AA135MC',
        status: 'IN_BAY',
        brand: 'Toyota',
        model: 'Camry',
        color: 'Blanco',
        service: 'Devuelvanme mis llantas :C',
        waitingMinutes: 15,
        ticketNumber: 1,

        createdAt: new Date()
      }
    },

    {
      id: 3,
      name: 'BAHÍA 3',
      currentVehicle: null
    }

  ];

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

      createdAt: new Date()
    }
  ];

  updateWaitingTimes() {

    const allVehicles = [

      ...this.waitingVehicles,

      ...this.completedVehicles,

      ...this.bays
        .filter(b => b.currentVehicle)
        .map(b => b.currentVehicle!)

    ];

    allVehicles.forEach(vehicle => {

      const diffMs =
        new Date().getTime() -
        new Date(vehicle.createdAt).getTime();

      vehicle.waitingMinutes =
        Math.floor(diffMs / 60000);

    });

  }

  completedVehicles: Vehicle[] = [];

  onVehicleDropped(data: any) {

    const draggedVehicle: Vehicle =
      data.event.item.data;

    const bay = this.bays.find(
      b => b.id === data.bayId
    );

    if (!bay) {
      return;
    }

    if (bay.currentVehicle) {
      return;
    }
    draggedVehicle.status = 'IN_BAY';
    bay.currentVehicle = draggedVehicle;


    this.waitingVehicles =
      this.waitingVehicles.filter(
        vehicle => vehicle.id !== draggedVehicle.id
      );

  }

  onVehicleReturned(event: any) {

    const draggedVehicle: Vehicle =
      event.item.data;

    const previousContainerId =
      event.previousContainer.id;

    const bayId =
      Number(
        previousContainerId.replace('bay-', '')
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

    bay.currentVehicle.status = 'WAITING';

    this.waitingVehicles.push(
      bay.currentVehicle
    );

    bay.currentVehicle = null;

  }
  onVehicleCompleted(bayId: number) {

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
      bay.currentVehicle
    );

    bay.currentVehicle = null;

  }

  createVehicle() {

    const vehicle: Vehicle = {

      id: Date.now(),

      ticketNumber: this.nextTicketNumber,

      patent: this.newVehicle.patent,

      brand: this.newVehicle.brand,

      model: this.newVehicle.model,

      color: this.newVehicle.color,

      service: this.newVehicle.service,

      waitingMinutes: 0,

      createdAt: new Date(),

      status: 'WAITING'

    };

    this.waitingVehicles.push(vehicle);

    this.waitingVehicles.sort(
      (a, b) =>
        a.ticketNumber - b.ticketNumber
    );

    this.nextTicketNumber++;

    this.showCreateVehicle = false;

    this.newVehicle = {

      patent: '',

      brand: '',

      model: '',

      color: '',

      service: ''

    };

  }
}
