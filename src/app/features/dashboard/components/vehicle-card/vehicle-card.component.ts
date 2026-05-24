import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-vehicle-card',
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    DragDropModule
  ]
})
export class VehicleCardComponent {

  @Input() vehicle!: Vehicle;

  @Input() draggable = true;

  get statusLabel(): string {

    switch (this.vehicle.status) {
      case 'in_queue':
        return 'En espera';
      case 'in_progress':
        return 'En proceso';
      case 'partial_completed':
        return 'Parcial';
      case 'not_completed':
        return 'No realizado';
      default:
        return 'Completo';
    }

  }

}
