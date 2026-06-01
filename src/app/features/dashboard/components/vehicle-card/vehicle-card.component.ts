import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-vehicle-card',
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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

  get paymentStatusLabel(): string {

    switch (this.vehicle.paymentStatus) {
      case 'paid':
        return 'Pagado';
      case 'partial':
        return 'Pago parcial';
      default:
        return 'No pagado';
    }

  }

  get paymentStatusClass(): string {

    return this.vehicle.paymentStatus ||
      'unpaid';

  }

  get waitingTimeLabel(): string {

    return this.formatDuration(
      this.vehicle.waitingMinutes * 60000
    );

  }

  get hasBoxTiming(): boolean {

    return !!(
      this.vehicle.boxStartedAt ||
      this.vehicle.boxElapsedMs
    );

  }

  get boxElapsedLabel(): string {

    const elapsedMs =
      this.getCurrentBoxElapsedMs();

    return this.formatDuration(
      elapsedMs
    );

  }

  get timePillLabel(): string {

    if (
      this.vehicle.status ===
      'in_progress'
    ) {
      return `Box ${this.boxElapsedLabel}`;
    }

    return `Espera ${this.waitingTimeLabel}`;

  }

  private getCurrentBoxElapsedMs(): number {

    const storedMs =
      this.vehicle.boxElapsedMs || 0;

    if (
      this.vehicle.status !==
        'in_progress' ||
      (
        !this.vehicle.boxTimerStartedAt &&
        !this.vehicle.boxStartedAt
      )
    ) {
      return storedMs;
    }

    const startedAt =
      new Date(
        this.vehicle.boxTimerStartedAt ||
          this.vehicle.boxStartedAt as Date
      ).getTime();

    if (Number.isNaN(startedAt)) {
      return storedMs;
    }

    return Math.max(
      storedMs +
        Date.now() -
        startedAt,
      0
    );

  }

  private formatDuration(
    valueMs: number
  ): string {

    const totalMinutes =
      Math.floor(valueMs / 60000);

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes} min`;

  }

}
