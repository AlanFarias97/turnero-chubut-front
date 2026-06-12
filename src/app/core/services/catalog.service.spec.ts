import {
  TestBed
} from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  environment
} from 'src/environments/environment';

import {
  CatalogService
} from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(CatalogService);

    httpMock =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should provide active cached default items', () => {
    expect(
      service.getActiveItems().length
    ).toBe(163);
  });

  it('should refresh items from the API', () => {
    const apiItem = {
      id: 900,
      code: 'API01',
      name: 'Servicio API',
      category: 'service' as const,
      active: true
    };

    service
      .refreshFromApi()
      .subscribe(items => {
        expect(items).toEqual([apiItem]);
      });

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/catalogs`
      );

    expect(request.request.method)
      .toBe('GET');

    request.flush([apiItem]);

    expect(service.getItems())
      .toEqual([apiItem]);
  });

  it('should save and normalize a catalog item through the API', () => {
    const savedItem = {
      id: 901,
      code: 'REP01',
      name: 'Reparar cubierta',
      category: 'repair' as const,
      active: true
    };

    service
      .saveItem({
        code: ' rep01 ',
        name: ' Reparar cubierta ',
        category: 'repair',
        active: true
      })
      .subscribe(item => {
        expect(item).toEqual(savedItem);
      });

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/catalogs`
      );

    expect(request.request.method)
      .toBe('POST');

    expect(request.request.body.code)
      .toBe('REP01');

    expect(request.request.body.name)
      .toBe('Reparar cubierta');

    request.flush(savedItem);

    expect(
      service.getItems()
        .some(item => item.code === 'REP01')
    ).toBeTrue();
  });

  it('should update active status through the API', () => {
    const updatedItem = {
      id: 1,
      code: 'A01',
      name: 'Balanceo auto',
      category: 'service' as const,
      active: false
    };

    service
      .setActive(1, false)
      .subscribe(item => {
        expect(item.active).toBeFalse();
      });

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/catalogs/1/active`
      );

    expect(request.request.method)
      .toBe('PATCH');

    expect(request.request.body)
      .toEqual({ active: false });

    request.flush(updatedItem);

    expect(
      service.getActiveItems()
        .some(item => item.id === 1)
    ).toBeFalse();
  });

  it('should delete an item through the API', () => {
    service
      .deleteItem(1)
      .subscribe();

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/catalogs/1`
      );

    expect(request.request.method)
      .toBe('DELETE');

    request.flush(null);

    expect(
      service.getItems()
        .some(item => item.id === 1)
    ).toBeFalse();
  });
});
