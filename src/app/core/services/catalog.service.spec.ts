import {
  TestBed
} from '@angular/core/testing';

import {
  CatalogService
} from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});

    service =
      TestBed.inject(CatalogService);
  });

  it('should provide active default items', () => {
    expect(
      service.getActiveItems().length
    ).toBe(163);
  });

  it('should save and normalize a catalog item', () => {
    const item =
      service.saveItem({
        code: ' rep01 ',
        name: ' Reparar cubierta ',
        category: 'repair',
        active: true
      });

    expect(item.code).toBe('REP01');
    expect(item.name).toBe(
      'Reparar cubierta'
    );
  });

  it('should hide inactive items from dropdown data', () => {
    service.setActive(1, false);

    expect(
      service.getActiveItems()
        .some(item => item.code === 'A01')
    ).toBeFalse();
  });

  it('should delete an item from the catalog', () => {
    service.deleteItem(1);

    expect(
      service.getItems()
        .some(item => item.id === 1)
    ).toBeFalse();
  });
});
