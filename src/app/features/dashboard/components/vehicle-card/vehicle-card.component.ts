import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
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
export class VehicleCardComponent
implements OnInit {

  @Input() vehicle!: Vehicle;

  @Input() draggable = true;

  @Output() moveRequested =
    new EventEmitter<Vehicle>();

  touchMovementEnabled = false;

  ngOnInit(): void {

    this.touchMovementEnabled =
      typeof window !== 'undefined' &&
      (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia(
          '(pointer: coarse)'
        ).matches
      );

  }

  get canDrag(): boolean {
    return (
      this.draggable &&
      !this.touchMovementEnabled
    );
  }

  get canRequestMove(): boolean {
    return (
      this.draggable &&
      this.touchMovementEnabled
    );
  }

  requestMove(
    event: Event
  ): void {

    event.preventDefault();

    event.stopPropagation();

    this.moveRequested.emit(
      this.vehicle
    );

  }

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
