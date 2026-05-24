import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkshopBoxComponent } from './workshop-box.component';

describe('WorkshopBoxComponent', () => {
  let component: WorkshopBoxComponent;
  let fixture: ComponentFixture<WorkshopBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WorkshopBoxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkshopBoxComponent);
    component = fixture.componentInstance;
    component.box = {
      id: 1,
      name: 'BOX 1',
      currentVehicle: null
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
