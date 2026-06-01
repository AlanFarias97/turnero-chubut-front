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

}
