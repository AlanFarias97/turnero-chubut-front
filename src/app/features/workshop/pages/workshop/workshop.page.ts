import {
  Component,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { WorkshopBoxComponent }
from '../../components/workshop-box/workshop-box.component';
import { WorkshopStateService } from 'src/app/core/services/workshop-state';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';


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

  private workshopStateService =
    inject(WorkshopStateService);

  private destroyRef =
    inject(DestroyRef);

  boxes: any[] = [];

  ngOnInit(): void {

    this.workshopStateService
      .bays$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
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
