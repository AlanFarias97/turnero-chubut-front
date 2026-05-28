import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { CatalogService } from 'src/app/core/services/catalog.service';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        CatalogService
      ]
    });

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter services from the active slash token', () => {
    const fakeQuill =
      createFakeQuill('Servicio /bd01');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();

    expect(component.showAutocomplete).toBeTrue();
    expect(component.filteredServices.length).toBe(1);
    expect(component.filteredServices[0].code).toBe('BD01');
  });

  it('should replace only the active slash token when selecting a service', () => {
    const fakeQuill =
      createFakeQuill('Servicio /bd01');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();
    component.selectService(
      component.filteredServices[0]
    );

    expect(fakeQuill.value).toBe(
      'Servicio BALANCEO AUTO DEPORTIVO '
    );
    expect(component.showAutocomplete).toBeFalse();
  });

  it('should insert the service name instead of the code', () => {
    const fakeQuill =
      createFakeQuill('/a01');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();
    component.selectService(
      component.filteredServices[0]
    );

    expect(fakeQuill.value).toBe(
      'ALINEACION AUTO '
    );
  });

  it('should filter and replace duplicated slash input on mobile', () => {
    const fakeQuill =
      createFakeQuill('//bd01');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();
    component.selectService(
      component.filteredServices[0]
    );

    expect(fakeQuill.value).toBe(
      'BALANCEO AUTO DEPORTIVO '
    );
  });

  it('should preserve bullet services when creating a vehicle', () => {
    component.newVehicle = {
      patent: 'LISTA01',
      description: 'Prueba',
      paymentStatus: 'partial',
      service:
        '<ol><li data-list="bullet">' +
        '<span class="ql-ui"></span>' +
        'Balanceo auto</li>' +
        '<li data-list="bullet">' +
        '<span class="ql-ui"></span>' +
        'Alineacion auto</li></ol>'
    };

    component.createVehicle();

    const createdVehicle =
      component.waitingVehicles.find(
        vehicle =>
          vehicle.patent === 'LISTA01'
      );

    expect(createdVehicle?.service).toBe(
      '<ul><li>Balanceo auto</li>' +
      '<li>Alineacion auto</li></ul>'
    );
    expect(createdVehicle?.paymentStatus).toBe(
      'partial'
    );
  });
});

function createFakeQuill(
  initialValue: string
) {

  let value =
    initialValue;

  let selectionIndex =
    initialValue.length;

  return {
    root: {
      clientWidth: 520
    },
    get value() {
      return value;
    },
    getSelection: () => ({
      index: selectionIndex
    }),
    getText: (
      start?: number,
      length?: number
    ) => {

      if (
        start === undefined ||
        length === undefined
      ) {
        return value;
      }

      return value.slice(
        start,
        start + length
      );

    },
    getBounds: () => ({
      top: 10,
      left: 12,
      height: 20
    }),
    deleteText: (
      start: number,
      length: number
    ) => {

      value =
        value.slice(0, start) +
        value.slice(start + length);

    },
    insertText: (
      start: number,
      text: string
    ) => {

      value =
        value.slice(0, start) +
        text +
        value.slice(start);

    },
    setSelection: (
      index: number
    ) => {

      selectionIndex = index;

    }
  };

}
