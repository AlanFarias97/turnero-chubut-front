import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  DestroyRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';

import { BayCardComponent }
from '../../components/bay-card/bay-card.component';

import { WaitingListComponent }
from '../../components/waiting-list/waiting-list.component';

import { Vehicle }
from '../../models/vehicle';

import { WorkshopStateService }
from 'src/app/core/services/workshop-state';

import {
  QuillModule
} from 'ngx-quill';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

interface ServiceCatalogItem {
  code: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    BayCardComponent,
    WaitingListComponent,
    FormsModule,
    QuillModule

  ]
})
export class DashboardPage
implements OnInit, OnDestroy {

  private workshopStateService =
    inject(WorkshopStateService);

  private destroyRef =
    inject(DestroyRef);

  currentDate = new Date();

  clockInterval: any;

  nextTicketNumber = 4;

  showCreateVehicle = false;

  isEditingVehicle = false;

  editingBayId: number | null = null;

  showAssignOperatorModal = false;

  selectedVehicleForBay: Vehicle | null = null;

  selectedBayId: number | null = null;

  selectedSourceContainerId: string | null = null;

  selectedOperators: string[] = [];

  filteredServices: ServiceCatalogItem[] = [];

  showAutocomplete = false;

  selectedAutocompleteIndex = 0;

  currentSlashQuery = '';

  activeServiceTokenStart: number | null = null;

  serviceEditor: any = null;

  autocompletePosition = {

    top: 0,

    left: 0

  };

  operators: string[] = [
    'Juan',
    'Martin',
    'Lucas',
    'Chino',
    'Gabi',
    'Beto'
  ];

  editorModules = {

    toolbar: [

      ['bold', 'italic', 'underline'],

      [{ list: 'ordered' }],

      [{ list: 'bullet' }],

      ['clean']

    ]

  };


  serviceCatalog: ServiceCatalogItem[] = [

    {
      code: 'DE01',
      name: 'Desarme y arme auto'
    },

    {
      code: 'DE02',
      name: 'Desarme y arme camioneta'
    },

    {
      code: 'BAL01',
      name: 'Balanceo auto'
    },

    {
      code: 'ALI01',
      name: 'Alineacion auto'
    }

  ];

  bays: any[] = [];

  waitingVehicles: Vehicle[] = [
    {
      id: 1,
      patent: 'AB123CD',
      status: 'WAITING',
      description: 'Gris',
      service: 'Cambio x2 delanteras',
      waitingMinutes: 15,
      ticketNumber: 2,
      assignedOperators: [],
      createdAt: new Date()
    }
  ];

  completedVehicles: Vehicle[] = [];

  newVehicle = {

    patent: '',

    description: '',

    service: ''

  };

  ngOnInit(): void {

    this.clockInterval =
      setInterval(() => {

        this.currentDate =
          new Date();

        this.updateWaitingTimes();

      }, 1000);

    this.workshopStateService
      .bays$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(bays => {

        this.bays = [...bays];

      });

  }

  ngOnDestroy(): void {

    clearInterval(
      this.clockInterval
    );

  }

  openCreateVehicleModal(): void {

    this.resetNewVehicleForm();

    this.isEditingVehicle =
      false;

    this.editingBayId =
      null;

    this.showCreateVehicle =
      true;

  }

  openEditVehicleModal(
    bayId: number
  ): void {

    const bay =
      this.bays.find(
        item =>
          item.id === bayId
      );

    if (!bay?.currentVehicle) {
      return;
    }

    const vehicle: Vehicle =
      bay.currentVehicle;

    this.resetNewVehicleForm();

    this.newVehicle = {

      patent:
        vehicle.patent,

      description:
        vehicle.description,

      service:
        vehicle.service

    };

    this.selectedOperators = [
      ...(vehicle.assignedOperators || [])
    ];

    this.isEditingVehicle =
      true;

    this.editingBayId =
      bayId;

    this.showCreateVehicle =
      true;

  }

  closeCreateVehicleModal(): void {

    this.showCreateVehicle =
      false;

    this.resetNewVehicleForm();

    this.hideServiceAutocomplete();

  }

  private resetNewVehicleForm(): void {

    this.newVehicle = {

      patent: '',

      description: '',

      service: ''

    };

    this.serviceEditor =
      null;

    this.selectedOperators = [];

    this.isEditingVehicle =
      false;

    this.editingBayId =
      null;

  }

  selectService(
    service: ServiceCatalogItem
  ): void {

    const quill: any =
      this.serviceEditor;

    if (
      !quill ||
      this.activeServiceTokenStart === null
    ) {
      return;
    }

    const insertText =
      `${service.name} `;

    const tokenStart =
      this.activeServiceTokenStart;

    const tokenLength =
      this.currentSlashQuery.length;

    quill.deleteText(
      tokenStart,
      tokenLength
    );

    quill.insertText(
      tokenStart,
      insertText
    );

    quill.setSelection(
      tokenStart +
      insertText.length
    );

    this.hideServiceAutocomplete();

  }

  onServiceInputChange(): void {

    const quill: any =
      this.serviceEditor;

    if (!quill) {
      return;
    }

    const token =
      this.getActiveSlashToken(quill);

    if (!token) {

      this.hideServiceAutocomplete();
      return;

    }

    this.currentSlashQuery =
      token.value;

    this.activeServiceTokenStart =
      token.start;

    const query =
      this.normalizeServiceTerm(
        token.value.slice(1)
      );

    this.filteredServices =
      this.serviceCatalog.filter(
        service =>

          this.normalizeServiceTerm(
            service.code
          )
            .includes(query)

      );

    this.showAutocomplete = true;

    this.selectedAutocompleteIndex =
      0;

  }

  onServiceEditorKeydown(
    event: KeyboardEvent
  ): void {

    if (!this.showAutocomplete) {
      return;
    }

    if (event.key === 'Escape') {

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.hideServiceAutocomplete();
      return;

    }

    if (
      this.filteredServices.length === 0
    ) {
      return;
    }

    if (event.key === 'ArrowDown') {

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.selectedAutocompleteIndex =
        (
          this.selectedAutocompleteIndex + 1
        ) %
        this.filteredServices.length;

      this.scrollActiveServiceIntoView();

      return;

    }

    if (event.key === 'ArrowUp') {

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.selectedAutocompleteIndex =
        (
          this.selectedAutocompleteIndex -
          1 +
          this.filteredServices.length
        ) %
        this.filteredServices.length;

      this.scrollActiveServiceIntoView();

      return;

    }

    if (event.key === 'Enter') {

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const selectedService =
        this.filteredServices[
          this.selectedAutocompleteIndex
        ];

      if (selectedService) {

        this.selectService(
          selectedService
        );

      }

    }

  }

  private scrollActiveServiceIntoView(): void {

    setTimeout(() => {

      const dropdown =
        document.querySelector(
          '.autocomplete-dropdown'
        ) as HTMLElement | null;

      const activeItem =
        dropdown?.querySelector(
          '.autocomplete-item.active'
        ) as HTMLElement | null;

      if (
        !dropdown ||
        !activeItem
      ) {
        return;
      }

      const itemTop =
        activeItem.offsetTop;

      const itemBottom =
        itemTop +
        activeItem.offsetHeight;

      const visibleTop =
        dropdown.scrollTop;

      const visibleBottom =
        visibleTop +
        dropdown.clientHeight;

      if (itemTop < visibleTop) {

        dropdown.scrollTop =
          itemTop;

        return;

      }

      if (itemBottom > visibleBottom) {

        dropdown.scrollTop =
          itemBottom -
          dropdown.clientHeight;

      }

    });

  }

  hideServiceAutocomplete(): void {

    this.showAutocomplete = false;

    this.filteredServices = [];

    this.currentSlashQuery = '';

    this.activeServiceTokenStart = null;

    this.selectedAutocompleteIndex = 0;

  }

  openServiceAutocompleteOnFocus(): void {

    const quill: any =
      this.serviceEditor;

    if (!quill) {
      return;
    }

    const editorText =
      quill.getText()
        .trim();

    if (editorText.length > 0) {
      return;
    }

    quill.insertText(
      0,
      '/'
    );

    quill.setSelection(1);

    this.onServiceInputChange();

  }

  private getActiveSlashToken(
    quill: any
  ): { start: number; value: string } | null {

    const range =
      quill.getSelection();

    if (!range) {
      return null;
    }

    const textBeforeCursor =
      quill.getText(
        0,
        range.index
      );

    const match =
      /(?:^|\s)(\/[^\s]*)$/.exec(
        textBeforeCursor
      );

    if (!match) {
      return null;
    }

    const value =
      match[1];

    return {
      start:
        textBeforeCursor.length -
        value.length,
      value
    };

  }

  private normalizeServiceTerm(
    value: string
  ): string {

    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  }


  updateWaitingTimes(): void {

    const allVehicles = [

      ...this.waitingVehicles,

      ...this.completedVehicles,

      ...this.bays
        .filter(
          bay => bay.currentVehicle
        )
        .map(
          bay => bay.currentVehicle
        )

    ];

    allVehicles.forEach(vehicle => {

      const diffMs =
        new Date().getTime() -
        new Date(vehicle.createdAt)
          .getTime();

      vehicle.waitingMinutes =
        Math.floor(diffMs / 60000);

    });

  }

  onVehicleDropped(data: any): void {

    const draggedVehicle: Vehicle =
      data.event.item.data;

    const bay = this.bays.find(
      b => b.id === data.bayId
    );

    if (!bay) {
      return;
    }

    const previousContainerId =
      data.event.previousContainer.id;

    const targetContainerId =
      `bay-${bay.id}`;

    if (
      previousContainerId ===
      targetContainerId
    ) {
      return;
    }

    if (bay.currentVehicle) {
      return;
    }

    this.selectedVehicleForBay =
      {
        ...draggedVehicle,
        assignedOperators: [
          ...(draggedVehicle.assignedOperators || [])
        ]
      };

    this.selectedBayId =
      bay.id;

    this.selectedSourceContainerId =
      previousContainerId;

    this.selectedOperators = [
      ...(draggedVehicle.assignedOperators || [])
    ];

    this.showAssignOperatorModal =
      true;

  }

  confirmAssignOperator(): void {

    if (
      !this.selectedVehicleForBay ||
      !this.selectedBayId
    ) {
      return;
    }

    const bay = this.bays.find(
      b => b.id === this.selectedBayId
    );

    if (!bay) {
      return;
    }

    this.removeVehicleFromSource(
      this.selectedVehicleForBay.id,
      this.selectedSourceContainerId
    );

    this.selectedVehicleForBay
      .assignedOperators =
      [...this.selectedOperators];

    this.selectedVehicleForBay
      .status = 'IN_BAY';

    bay.currentVehicle =
      {
        ...this.selectedVehicleForBay
      };

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

    this.showAssignOperatorModal =
      false;

    this.selectedVehicleForBay =
      null;

    this.selectedBayId =
      null;

    this.selectedSourceContainerId =
      null;

    this.selectedOperators = [];

  }

  cancelAssignOperator(): void {

    this.showAssignOperatorModal =
      false;

    this.selectedVehicleForBay =
      null;

    this.selectedBayId =
      null;

    this.selectedSourceContainerId =
      null;

    this.selectedOperators = [];

  }

  onVehicleReturned(
    event: any
  ): void {

    const dropEvent =
      event.event;

    if (
      event.listId !== 'waiting-list' ||
      !dropEvent
    ) {
      return;
    }

    const vehicle: Vehicle =
      dropEvent.item.data;

    const previousContainerId =
      dropEvent.previousContainer.id;

    if (
      previousContainerId ===
      'waiting-list'
    ) {
      return;
    }

    if (
      previousContainerId !==
      'completed-list' &&
      !previousContainerId.startsWith('bay-')
    ) {
      return;
    }

    this.removeVehicleFromSource(
      vehicle.id,
      previousContainerId
    );

    const returnedVehicle: Vehicle = {

      ...vehicle,

      status: 'WAITING',

      assignedOperators: []

    };

    this.waitingVehicles.push(
      returnedVehicle
    );

    this.waitingVehicles.sort(
      (a, b) =>
        a.ticketNumber -
        b.ticketNumber
    );

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

  }

  private removeVehicleFromSource(
    vehicleId: number,
    sourceContainerId: string | null
  ): void {

    if (!sourceContainerId) {
      return;
    }

    if (sourceContainerId === 'waiting-list') {

      this.waitingVehicles =
        this.waitingVehicles.filter(
          vehicle =>
            vehicle.id !== vehicleId
        );

      return;

    }

    if (sourceContainerId === 'completed-list') {

      this.completedVehicles =
        this.completedVehicles.filter(
          vehicle =>
            vehicle.id !== vehicleId
        );

      return;

    }

    if (
      sourceContainerId.startsWith('bay-')
    ) {

      const bayId =
        Number(
          sourceContainerId.replace(
            'bay-',
            ''
          )
        );

      const bay =
        this.bays.find(
          item =>
            item.id === bayId
        );

      if (
        bay?.currentVehicle?.id === vehicleId
      ) {

        bay.currentVehicle = null;

      }

    }

  }

  onVehicleCompleted(
    bayId: number
  ): void {

    const bay = this.bays.find(
      b => b.id === bayId
    );

    if (!bay) {
      return;
    }

    if (!bay.currentVehicle) {
      return;
    }

    bay.currentVehicle.status =
      'COMPLETED';

    this.completedVehicles.unshift(
      {
        ...bay.currentVehicle
      }
    );

    bay.currentVehicle = null;

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

  }

  createVehicle(): void {

    if (this.isEditingVehicle) {

      this.updateEditedVehicle();
      return;

    }

    const vehicle: Vehicle = {

      id: Date.now(),

      ticketNumber:
        this.nextTicketNumber,

      patent:
        this.newVehicle.patent,

      description:
      this.newVehicle.description,

      service:
      this.extractPlainText(
        this.newVehicle.service
      ),

      waitingMinutes: 0,

      createdAt: new Date(),

      status: 'WAITING',

      assignedOperators: []

    };

    this.waitingVehicles.push(
      vehicle
    );

    this.waitingVehicles.sort(
      (a, b) =>
        a.ticketNumber -
        b.ticketNumber
    );

    this.nextTicketNumber++;

    this.closeCreateVehicleModal();

  }

  private updateEditedVehicle(): void {

    if (this.editingBayId === null) {
      return;
    }

    const bay =
      this.bays.find(
        item =>
          item.id === this.editingBayId
      );

    if (!bay?.currentVehicle) {
      return;
    }

    bay.currentVehicle = {

      ...bay.currentVehicle,

      patent:
        this.newVehicle.patent,

      description:
        this.newVehicle.description,

      service:
        this.extractPlainText(
          this.newVehicle.service
        ),

      assignedOperators:
        [...this.selectedOperators]

    };

    this.bays = [...this.bays];

    this.workshopStateService
      .updateBays(this.bays);

    this.closeCreateVehicleModal();

  }

  onOperatorToggle(
    operator: string,
    event: any
  ): void {

    if (event.target.checked) {

      if (
        !this.selectedOperators.includes(
          operator
        )
      ) {

        this.selectedOperators.push(
          operator
        );

      }

    } else {

      this.selectedOperators =
        this.selectedOperators.filter(
          op => op !== operator
        );

    }

  }
  onCompletedVehicleReturned(
    event: any
  ): void {

    const dropEvent =
      event.event;

    if (
      event.listId !== 'completed-list' ||
      !dropEvent
    ) {
      return;
    }

    if (
      dropEvent.previousContainer.id !==
      'completed-list'
    ) {
      return;
    }

  }
  extractPlainText(
    html: string
  ): string {

    const div =
      document.createElement('div');

    div.innerHTML = html;

    return (
      div.textContent ||
      div.innerText ||
      ''
    ).trim();

  }

  onEditorCreated(
    quill: any
  ): void {

    this.serviceEditor =
      quill;

    quill.root.addEventListener(
      'keydown',
      (event: KeyboardEvent) =>
        this.onServiceEditorKeydown(event),
      true
    );

    quill.root.addEventListener(
      'focus',
      () =>
        this.openServiceAutocompleteOnFocus()
    );

    quill.root.addEventListener(
      'click',
      () =>
        this.openServiceAutocompleteOnFocus()
    );

    quill.keyboard.addBinding(
      {
        key: 40 // ArrowDown
      },
      () => {

        if (!this.showAutocomplete) {
          return true;
        }

        if (
          this.filteredServices.length === 0
        ) {
          return false;
        }

        this.selectedAutocompleteIndex++;

        if (
          this.selectedAutocompleteIndex >=
          this.filteredServices.length
        ) {

          this.selectedAutocompleteIndex = 0;

        }

        return false;

      }
    );

    quill.keyboard.addBinding(
      {
        key: 38 // ArrowUp
      },
      () => {

        if (!this.showAutocomplete) {
          return true;
        }

        if (
          this.filteredServices.length === 0
        ) {
          return false;
        }

        this.selectedAutocompleteIndex--;

        if (
          this.selectedAutocompleteIndex < 0
        ) {

          this.selectedAutocompleteIndex =
            this.filteredServices.length - 1;

        }

        return false;

      }
    );

    quill.keyboard.addBinding(
      {
        key: 13 // Enter
      },
      () => {

        if (!this.showAutocomplete) {
          return true;
        }

        if (
          this.filteredServices.length === 0
        ) {
          return true;
        }

        const selectedService =
          this.filteredServices[
            this.selectedAutocompleteIndex
          ];

        if (selectedService) {

          this.selectService(
            selectedService
          );

        }

        return false;

      }
    );

    quill.keyboard.addBinding(
      {
        key: 27 // Escape
      },
      () => {

        if (!this.showAutocomplete) {
          return true;
        }

        this.hideServiceAutocomplete();

        return false;

      }
    );

  }
}
