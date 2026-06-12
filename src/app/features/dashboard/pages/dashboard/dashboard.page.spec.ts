import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardPage } from './dashboard.page';
import { CatalogService } from 'src/app/core/services/catalog.service';
import {
  DashboardState,
  VehicleService
} from 'src/app/core/services/vehicle.service';
import { Vehicle } from '../../models/vehicle';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let vehicleServiceSpy:
    jasmine.SpyObj<VehicleService>;

  const baseVehicle: Vehicle = {
    id: 1,
    patent: 'AB123CD',
    status: 'in_queue',
    paymentStatus: 'unpaid',
    description: 'Gris',
    service: 'Cambio x2 delanteras',
    waitingMinutes: 15,
    boxElapsedMs: 0,
    ticketNumber: 2,
    assignedOperators: [],
    createdAt: new Date('2026-05-01T09:00:00')
  };

  beforeEach(() => {
    localStorage.clear();

    vehicleServiceSpy =
      jasmine.createSpyObj<VehicleService>(
        'VehicleService',
        [
          'getDashboardState',
          'createVehicle',
          'updateVehicle',
          'assignToBay',
          'moveToQueue',
          'completeVehicle'
        ]
      );

    vehicleServiceSpy.getDashboardState
      .and.returnValue(
        of(createDashboardState())
      );

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        CatalogService,
        {
          provide: VehicleService,
          useValue: vehicleServiceSpy
        }
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

    vehicleServiceSpy.createVehicle
      .and.returnValue(
        of({
          ...baseVehicle,
          id: 99,
          patent: 'LISTA01',
          paymentStatus: 'partial'
        })
      );

    component.createVehicle();

    expect(
      vehicleServiceSpy.createVehicle
    ).toHaveBeenCalledWith(
      jasmine.objectContaining({
        patent: 'LISTA01',
        paymentStatus: 'partial',
        service:
          '<ul><li>Balanceo auto</li>' +
          '<li>Alineacion auto</li></ul>'
      })
    );

    const createRequest =
      vehicleServiceSpy.createVehicle
        .calls.mostRecent().args[0];

    expect(createRequest.service).toBe(
      '<ul><li>Balanceo auto</li>' +
      '<li>Alineacion auto</li></ul>'
    );
    expect(createRequest.paymentStatus).toBe(
      'partial'
    );
  });

  it('should start box timing when assigning a vehicle to a box', () => {
    const vehicle =
      component.waitingVehicles[0];

    component.selectedVehicleForBay = {
      ...vehicle
    };
    component.selectedBayId = 1;
    component.selectedSourceContainerId =
      'waiting-list';
    component.selectedOperators = ['Chino'];

    const assignedVehicle: Vehicle = {
      ...vehicle,
      status: 'in_progress',
      assignedOperators: ['Chino'],
      boxStartedAt: new Date(),
      boxTimerStartedAt: new Date(),
      boxElapsedMs: 0
    };

    vehicleServiceSpy.assignToBay
      .and.returnValue(
        of(createDashboardState({
          bays: [
            {
              id: 1,
              name: 'BOX 1',
              currentVehicle: assignedVehicle
            },
            {
              id: 2,
              name: 'BOX 2',
              currentVehicle: null
            },
            {
              id: 3,
              name: 'BOX 3',
              currentVehicle: null
            }
          ],
          waitingVehicles: []
        }))
      );

    component.confirmAssignOperator();

    expect(
      vehicleServiceSpy.assignToBay
    ).toHaveBeenCalledWith(
      vehicle.id,
      1,
      ['Chino']
    );

    const currentVehicle =
      component.bays[0].currentVehicle;

    expect(currentVehicle?.status).toBe(
      'in_progress'
    );
    expect(currentVehicle?.boxStartedAt)
      .toBeTruthy();
    expect(currentVehicle?.boxTimerStartedAt)
      .toBeTruthy();
    expect(currentVehicle?.boxElapsedMs)
      .toBe(0);
  });

  it('should preserve box timing when moving between boxes', () => {
    const startedAt =
      new Date('2026-05-01T10:00:00');

    component.bays[0].currentVehicle = {
      ...component.waitingVehicles[0],
      status: 'in_progress',
      assignedOperators: ['Chino'],
      boxStartedAt: startedAt,
      boxTimerStartedAt: startedAt,
      boxElapsedMs: 120000
    };
    component.waitingVehicles = [];

    component.selectedVehicleForBay = {
      ...component.bays[0].currentVehicle
    };
    component.selectedBayId = 2;
    component.selectedSourceContainerId =
      'bay-1';
    component.selectedOperators = ['Chino'];

    vehicleServiceSpy.assignToBay
      .and.returnValue(
        of(createDashboardState({
          bays: [
            {
              id: 1,
              name: 'BOX 1',
              currentVehicle: null
            },
            {
              id: 2,
              name: 'BOX 2',
              currentVehicle: {
                ...component.bays[0].currentVehicle,
                status: 'in_progress',
                assignedOperators: ['Chino'],
                boxStartedAt: startedAt,
                boxTimerStartedAt: new Date(),
                boxElapsedMs: 120000
              } as Vehicle
            },
            {
              id: 3,
              name: 'BOX 3',
              currentVehicle: null
            }
          ],
          waitingVehicles: []
        }))
      );

    component.confirmAssignOperator();

    expect(component.bays[1].currentVehicle?.boxStartedAt)
      .toEqual(startedAt);
    expect(component.bays[1].currentVehicle?.boxElapsedMs)
      .toBe(120000);
  });

  it('should reset box timing when a partial vehicle returns to a box', () => {
    const oldStartedAt =
      new Date('2026-05-01T10:00:00');

    const partialVehicle = {
      ...component.waitingVehicles[0],
      status: 'partial_completed' as const,
      boxStartedAt: oldStartedAt,
      boxElapsedMs: 900000,
      resetBoxTimerOnNextAssignment: true
    };

    component.completedVehicles = [
      partialVehicle
    ];
    component.waitingVehicles = [];

    component.selectedVehicleForBay = {
      ...partialVehicle
    };
    component.selectedBayId = 1;
    component.selectedSourceContainerId =
      'completed-list';
    component.selectedOperators = ['Chino'];

    vehicleServiceSpy.assignToBay
      .and.returnValue(
        of(createDashboardState({
          bays: [
            {
              id: 1,
              name: 'BOX 1',
              currentVehicle: {
                ...partialVehicle,
                status: 'in_progress',
                assignedOperators: ['Chino'],
                boxStartedAt: new Date(),
                boxTimerStartedAt: new Date(),
                boxElapsedMs: 0,
                resetBoxTimerOnNextAssignment: false
              }
            },
            {
              id: 2,
              name: 'BOX 2',
              currentVehicle: null
            },
            {
              id: 3,
              name: 'BOX 3',
              currentVehicle: null
            }
          ],
          waitingVehicles: [],
          completedVehicles: []
        }))
      );

    component.confirmAssignOperator();

    const assignedVehicle =
      component.bays[0].currentVehicle;

    expect(assignedVehicle?.boxElapsedMs)
      .toBe(0);
    expect(
      new Date(
        assignedVehicle?.boxStartedAt as Date
      ).getTime()
    ).toBeGreaterThan(
      oldStartedAt.getTime()
    );
    expect(
      assignedVehicle
        ?.resetBoxTimerOnNextAssignment
    ).toBeFalse();
  });
});

function createDashboardState(
  overrides: Partial<DashboardState> = {}
): DashboardState {

  return {
    bays: [
      {
        id: 1,
        name: 'BOX 1',
        currentVehicle: null
      },
      {
        id: 2,
        name: 'BOX 2',
        currentVehicle: null
      },
      {
        id: 3,
        name: 'BOX 3',
        currentVehicle: null
      }
    ],
    waitingVehicles: [
      {
        id: 1,
        patent: 'AB123CD',
        status: 'in_queue',
        paymentStatus: 'unpaid',
        description: 'Gris',
        service: 'Cambio x2 delanteras',
        waitingMinutes: 15,
        boxElapsedMs: 0,
        ticketNumber: 2,
        assignedOperators: [],
        createdAt: new Date('2026-05-01T09:00:00')
      }
    ],
    completedVehicles: [],
    nextTicketNumber: 3,
    ...overrides
  };

}

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
