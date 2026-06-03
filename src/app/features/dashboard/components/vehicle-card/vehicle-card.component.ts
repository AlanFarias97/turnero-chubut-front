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

interface TimePill {

  label: string;

  value: string;

}

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
      this.getWaitingElapsedMs()
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

  get totalElapsedLabel(): string {

    return this.formatDuration(
      this.getTotalElapsedMs()
    );

  }

  get timePills(): TimePill[] {

    if (this.vehicle.status === 'in_queue') {
      return [
        {
          label: 'Espera',
          value: this.waitingTimeLabel
        }
      ];
    }

    if (this.vehicle.status === 'in_progress') {
      return [
        {
          label: 'Total',
          value: this.totalElapsedLabel
        },
        {
          label: 'Trabajado',
          value: this.boxElapsedLabel
        }
      ];
    }

    return [
      {
        label: 'Espera',
        value: this.waitingTimeLabel
      },
      {
        label: 'Total',
        value: this.totalElapsedLabel
      }
    ];

  }

  trackByTimePill(
    _: number,
    pill: TimePill
  ): string {

    return pill.label;

  }

  private getWaitingElapsedMs(): number {

    const createdAt =
      this.getDateTime(
        this.vehicle.createdAt
      );

    if (createdAt === null) {
      return this.vehicle.waitingMinutes *
        60000;
    }

    const firstBoxStart =
      this.getDateTime(
        this.vehicle.boxStartedAt
      );

    if (firstBoxStart !== null) {
      return Math.max(
        firstBoxStart - createdAt,
        0
      );
    }

    if (this.vehicle.status === 'in_queue') {
      return Math.max(
        Date.now() - createdAt,
        0
      );
    }

    return this.vehicle.waitingMinutes *
      60000;

  }

  private getTotalElapsedMs(): number {

    const createdAt =
      this.getDateTime(
        this.vehicle.createdAt
      );

    if (createdAt === null) {
      return this.vehicle.waitingMinutes *
        60000;
    }

    if (this.vehicle.status === 'in_progress') {
      return Math.max(
        Date.now() - createdAt,
        0
      );
    }

    const endedAt =
      this.getDateTime(
        this.vehicle.boxEndedAt
      );

    if (endedAt !== null) {
      return Math.max(
        endedAt - createdAt,
        0
      );
    }

    const firstBoxStart =
      this.getDateTime(
        this.vehicle.boxStartedAt
      );

    if (firstBoxStart !== null) {
      return Math.max(
        firstBoxStart -
          createdAt +
          this.getCurrentBoxElapsedMs(),
        0
      );
    }

    return this.vehicle.waitingMinutes *
      60000;

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

  private getDateTime(
    value?: Date
  ): number | null {

    if (!value) {
      return null;
    }

    const time =
      new Date(value).getTime();

    return Number.isNaN(time)
      ? null
      : time;

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
