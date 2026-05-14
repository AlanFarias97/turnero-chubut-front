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

}
