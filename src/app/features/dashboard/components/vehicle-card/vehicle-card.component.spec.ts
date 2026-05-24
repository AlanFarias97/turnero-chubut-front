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
      status: 'WAITING',
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
});
