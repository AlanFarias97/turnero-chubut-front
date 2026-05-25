import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter services from the active slash token', () => {
    const fakeQuill =
      createFakeQuill('Servicio /bal');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();

    expect(component.showAutocomplete).toBeTrue();
    expect(component.filteredServices.length).toBe(1);
    expect(component.filteredServices[0].code).toBe('BAL01');
  });

  it('should replace only the active slash token when selecting a service', () => {
    const fakeQuill =
      createFakeQuill('Servicio /bal');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();
    component.selectService(
      component.filteredServices[0]
    );

    expect(fakeQuill.value).toBe(
      'Servicio Balanceo auto '
    );
    expect(component.showAutocomplete).toBeFalse();
  });

  it('should insert the service name instead of the code', () => {
    const fakeQuill =
      createFakeQuill('/ali');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();
    component.selectService(
      component.filteredServices[0]
    );

    expect(fakeQuill.value).toBe(
      'Alineacion auto '
    );
  });

  it('should filter and replace duplicated slash input on mobile', () => {
    const fakeQuill =
      createFakeQuill('//bal');

    component.serviceEditor = fakeQuill;

    component.onServiceInputChange();
    component.selectService(
      component.filteredServices[0]
    );

    expect(fakeQuill.value).toBe(
      'Balanceo auto '
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
