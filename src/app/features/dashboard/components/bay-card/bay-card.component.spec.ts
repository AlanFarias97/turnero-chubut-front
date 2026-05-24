import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BayCardComponent } from './bay-card.component';

describe('BayCardComponent', () => {
  let component: BayCardComponent;
  let fixture: ComponentFixture<BayCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BayCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BayCardComponent);
    component = fixture.componentInstance;
    component.bay = {
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
