import {
  Injectable,
  NgZone,
  inject
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkshopStateService {

  private ngZone = inject(NgZone);

  private readonly storageKey =
    'turnero-chubut:bays';

  private readonly defaultBays = [
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
  ];

  private channel =
    new BroadcastChannel(
      'workshop-channel'
    );

  private baysSubject =
    new BehaviorSubject<any[]>(
      this.getInitialBays()
    );

  bays$ =
    this.baysSubject.asObservable();

    constructor() {

      this.channel.onmessage = (
        event
      ) => {

        if (
          event.data?.type ===
          'BAYS_UPDATED'
        ) {

          this.ngZone.run(() => {

            const clonedBays =
              this.cloneBays(
                event.data.payload
              );

            this.baysSubject.next(
              clonedBays
            );

            this.saveBays(
              clonedBays
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

    const clonedBays =
      this.cloneBays(
        bays
      );

    this.baysSubject.next(
      clonedBays
    );

    this.saveBays(
      clonedBays
    );

    this.channel.postMessage({

      type: 'BAYS_UPDATED',

      payload: clonedBays

    });

  }

  private getInitialBays(): any[] {

    const savedBays =
      this.loadBays();

    if (savedBays) {
      return savedBays;
    }

    return this.cloneBays(
      this.defaultBays
    );

  }

  private loadBays(): any[] | null {

    const rawBays =
      localStorage.getItem(
        this.storageKey
      );

    if (!rawBays) {
      return null;
    }

    try {

      return this.cloneBays(
        JSON.parse(rawBays)
      );

    } catch {

      localStorage.removeItem(
        this.storageKey
      );

      return null;

    }

  }

  private saveBays(
    bays: any[]
  ): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(bays)
    );

  }

  private cloneBays(
    bays: any[]
  ): any[] {

    return bays.map(
      bay => ({
        ...bay,
        currentVehicle:
          bay.currentVehicle
            ? {
                ...bay.currentVehicle,
                status:
                  this.normalizeStatus(
                    bay.currentVehicle.status
                  ),
                paymentStatus:
                  this.normalizePaymentStatus(
                    bay.currentVehicle
                      .paymentStatus
                  ),
                boxElapsedMs:
                  bay.currentVehicle
                    .boxElapsedMs || 0
              }
            : null
      })
    );

  }

  private normalizeStatus(
    status: string
  ): string {

    const statusMap: Record<string, string> = {
      WAITING: 'in_queue',
      IN_BAY: 'in_progress',
      COMPLETED: 'completed'
    };

    return statusMap[status] || status;

  }

  private normalizePaymentStatus(
    status?: string
  ): string {

    const statusMap: Record<string, string> = {
      NOT_PAID: 'unpaid',
      PARTIALLY_PAID: 'partial',
      PAID: 'paid'
    };

    return status
      ? statusMap[status] || status
      : 'unpaid';

  }

}
