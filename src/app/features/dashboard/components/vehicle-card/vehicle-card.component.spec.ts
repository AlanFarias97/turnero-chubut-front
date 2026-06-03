import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VehicleCardComponent } from './vehicle-card.component';

describe('VehicleCardComponent', () => {
  let component: VehicleCardComponent;
  let fixture: ComponentFixture<VehicleCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VehicleCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleCardComponent);
    component = fixture.componentInstance;
    component.vehicle = {
      id: 1,
      patent: 'AB123CD',
      service: 'Cambio x2 delanteras',
      waitingMinutes: 10,
      boxElapsedMs: 0,
      status: 'in_queue',
      paymentStatus: 'unpaid',
      ticketNumber: 1,
      createdAt: new Date(),
      description: 'Gris',
      assignedOperators: []
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should label partial payments', () => {
    component.vehicle.paymentStatus =
      'partial';

    expect(
      component.paymentStatusLabel
    ).toBe('Pago parcial');
  });

  it('should show box time while vehicle is in progress', () => {
    const startedAt =
      new Date(
        Date.now() - 11 * 60000 - 1000
      );
    const createdAt =
      new Date(
        Date.now() - 21 * 60000 - 1000
      );

    component.vehicle = {
      ...component.vehicle,
      status: 'in_progress',
      createdAt,
      boxStartedAt: startedAt,
      boxTimerStartedAt: startedAt,
      boxElapsedMs: 0
    };

    expect(component.timePills)
      .toEqual([
        {
          label: 'Total',
          value: '21 min'
        },
        {
          label: 'Trabajado',
          value: '11 min'
        }
      ]);
    expect(component.boxElapsedLabel)
      .toBe('11 min');
  });

  it('should show waiting and total time when vehicle is finished', () => {
    const createdAt =
      new Date('2026-06-03T08:00:00');
    const boxStartedAt =
      new Date('2026-06-03T08:12:00');
    const boxEndedAt =
      new Date('2026-06-03T08:42:00');

    component.vehicle = {
      ...component.vehicle,
      status: 'completed',
      createdAt,
      boxStartedAt,
      boxEndedAt,
      boxElapsedMs: 30 * 60000
    };

    expect(component.timePills)
      .toEqual([
        {
          label: 'Espera',
          value: '12 min'
        },
        {
          label: 'Total',
          value: '42 min'
        }
      ]);
  });
});
