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

    component.vehicle = {
      ...component.vehicle,
      status: 'in_progress',
      boxStartedAt: startedAt,
      boxTimerStartedAt: startedAt,
      boxElapsedMs: 0
    };

    expect(component.timePillLabel)
      .toBe('Box 11 min');
    expect(component.boxElapsedLabel)
      .toBe('11 min');
  });
});
