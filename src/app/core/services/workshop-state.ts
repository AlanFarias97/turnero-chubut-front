import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkshopStateService {

  private channel =
    new BroadcastChannel(
      'workshop-channel'
    );

  private baysSubject =
    new BehaviorSubject<any[]>([
      {
        id: 1,
        name: 'BOX 1',
        currentVehicle: null
      },
      {
        id: 2,
        name: 'BOX 2',
        currentVehicle: null
      },
      {
        id: 3,
        name: 'BOX 3',
        currentVehicle: null
      }
    ]);

  bays$ =
    this.baysSubject.asObservable();

    constructor(
      private ngZone: NgZone
    ) {

      this.channel.onmessage = (
        event
      ) => {

        if (
          event.data?.type ===
          'BAYS_UPDATED'
        ) {

          this.ngZone.run(() => {

            this.baysSubject.next(
              event.data.payload.map(
                (bay: any) => ({
                  ...bay,
                  currentVehicle:
                    bay.currentVehicle
                      ? {
                          ...bay.currentVehicle
                        }
                      : null
                })
              )
            );

          });

        }

      };

    }

  getCurrentBays(): any[] {

    return this.baysSubject.value;

  }

  updateBays(
    bays: any[]
  ): void {

    const clonedBays = bays.map(
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

    this.baysSubject.next(
      clonedBays
    );

    this.channel.postMessage({

      type: 'BAYS_UPDATED',

      payload: clonedBays

    });

  }

}
