import { Component, Input,  Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../models/vehicle';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { VehicleCardComponent } from '../vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.component.html',
  styleUrls: ['./waiting-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    VehicleCardComponent,
    DragDropModule
  ]
})
export class WaitingListComponent {

  @Input() vehicles: Vehicle[] = [];
  @Output() vehicleReturned =
  new EventEmitter<any>();
  @Output() vehicleMoveRequested =
  new EventEmitter<{
    vehicle: Vehicle;
    sourceContainerId: string;
  }>();
  @Input() title = '';
  @Input() listId = 'waiting-list';

  canEnter = (
    drag: any
  ): boolean => {

    const vehicle: Vehicle =
      drag.data;

    if (vehicle?.status === 'completed') {
      return false;
    }

    return (
      this.listId !== 'completed-list' ||
      drag.dropContainer.id === 'completed-list'
    );

  };

  get connectedDropLists(): string[] {

    if (
      this.listId === 'completed-list'
    ) {

      return [
        'waiting-list',
        'bay-1',
        'bay-2',
        'bay-3'
      ];

    }

    return [
      'bay-1',
      'bay-2',
      'bay-3'
    ];

  }

  onDrop(event: any) {

    this.vehicleReturned.emit({
      listId: this.listId,
      event
    });

  }

  requestMove(
    vehicle: Vehicle
  ): void {

    this.vehicleMoveRequested.emit({
      vehicle,
      sourceContainerId:
        this.listId
    });

  }
}
