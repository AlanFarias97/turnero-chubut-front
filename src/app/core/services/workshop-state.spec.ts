import { TestBed } from '@angular/core/testing';

import { WorkshopState } from './workshop-state';

describe('WorkshopState', () => {
  let service: WorkshopState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkshopState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
