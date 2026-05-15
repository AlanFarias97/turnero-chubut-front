import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { WorkshopBoxComponent }
from '../../components/workshop-box/workshop-box.component';
import { WorkshopStateService } from 'src/app/core/services/workshop-state';



@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.page.html',
  styleUrls: ['./workshop.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    WorkshopBoxComponent
  ]
})
export class WorkshopPage
implements OnInit {

  boxes: any[] = [];

  constructor(
    private workshopStateService:
    WorkshopStateService
  ) {}

  ngOnInit(): void {

    this.workshopStateService
      .bays$
      .subscribe(bays => {

        this.boxes = bays.map(
          bay => ({
            ...bay,
            currentVehicle:
              bay.currentVehicle
                ? {
                    ...bay.currentVehicle
                  }
                : null
          })
        );
      });

  }

}
