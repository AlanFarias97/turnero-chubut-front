import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workshop-box',
  templateUrl: './workshop-box.component.html',
  styleUrls: ['./workshop-box.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class WorkshopBoxComponent {

  @Input() box: any;

  boxElapsedLabel(): string {

    const vehicle =
      this.box?.currentVehicle;

    if (!vehicle) {
      return '0 min';
    }

    const storedMs =
      vehicle.boxElapsedMs || 0;

    if (
      vehicle.status !== 'in_progress' ||
      (
        !vehicle.boxTimerStartedAt &&
        !vehicle.boxStartedAt
      )
    ) {
      return this.formatDuration(
        storedMs
      );
    }

    const startedAt =
      new Date(
        vehicle.boxTimerStartedAt ||
          vehicle.boxStartedAt
      ).getTime();

    if (Number.isNaN(startedAt)) {
      return this.formatDuration(
        storedMs
      );
    }

    return this.formatDuration(
      Math.max(
        storedMs +
          Date.now() -
          startedAt,
        0
      )
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
