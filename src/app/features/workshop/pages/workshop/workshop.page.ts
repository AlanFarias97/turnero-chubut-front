import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  DestroyRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { IonContent } from '@ionic/angular/standalone';

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
    IonContent,
    WorkshopBoxComponent
  ]
})
export class WorkshopPage
implements OnInit, OnDestroy {

  private workshopStateService =
    inject(WorkshopStateService);

  private destroyRef =
    inject(DestroyRef);

  boxes: any[] = [];

  private clockInterval: any;

  ngOnInit(): void {

    this.clockInterval =
      setInterval(() => {

        this.boxes = [...this.boxes];

      }, 1000);

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

  ngOnDestroy(): void {

    clearInterval(
      this.clockInterval
    );

  }

}
