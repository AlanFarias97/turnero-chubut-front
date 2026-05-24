import { Component, Input,  Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

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
    IonicModule,
    VehicleCardComponent,
    DragDropModule
  ]
})
export class WaitingListComponent {

  @Input() vehicles: Vehicle[] = [];
  @Output() vehicleReturned =
  new EventEmitter<any>();
  @Input() title = '';
  @Input() listId = 'waiting-list';

  canEnter = (
    drag: any
  ): boolean =>
    this.listId !== 'completed-list' ||
    drag.dropContainer.id === 'completed-list';

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
}
