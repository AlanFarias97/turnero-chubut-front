import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Bay } from '../../models/bay';
import { VehicleCardComponent } from '../vehicle-card/vehicle-card.component';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-bay-card',
  templateUrl: './bay-card.component.html',
  styleUrls: ['./bay-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    DragDropModule,
    VehicleCardComponent,
  ]
})
export class BayCardComponent {

  @Input() bay!: Bay;
  @Output() vehicleDropped = new EventEmitter<any>();
  @Output() vehicleCompleted =
  new EventEmitter<number>();
  @Output() vehicleEditRequested =
  new EventEmitter<number>();

  canEnter = (
    drag: { data?: Vehicle }
  ): boolean =>
    drag.data?.status !== 'completed';

  onDrop(event: any) {

    this.vehicleDropped.emit({
      bayId: this.bay.id,
      event
    });

  }
  completeVehicle() {

    this.vehicleCompleted.emit(
      this.bay.id
    );

  }

  editVehicle() {

    this.vehicleEditRequested.emit(
      this.bay.id
    );

  }
}
