import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  IonContent
} from '@ionic/angular/standalone';

import {
  CatalogCategory,
  CatalogItem
} from 'src/app/core/models/catalog-item';

import {
  CatalogService
} from 'src/app/core/services/catalog.service';

type CatalogFilter =
  | 'all'
  | CatalogCategory;

@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.page.html',
  styleUrls: ['./catalogs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    RouterLink
  ]
})
export class CatalogsPage implements OnInit {

  private catalogService =
    inject(CatalogService);

  items: CatalogItem[] = [];

  selectedFilter: CatalogFilter =
    'all';

  searchTerm = '';

  selectedItem: CatalogItem | null =
    null;

  itemToDelete: CatalogItem | null =
    null;

  showForm = false;

  draft: Omit<CatalogItem, 'id'>
    & { id?: number } =
      this.emptyDraft('service');

  formError = '';

  ngOnInit(): void {

    this.refreshItems();

  }

  get filteredItems(): CatalogItem[] {

    const query =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.items
      .filter(item =>
        this.selectedFilter === 'all' ||
        item.category ===
          this.selectedFilter
      )
      .filter(item =>
        !query ||
        item.code.toLowerCase()
          .includes(query) ||
        item.name.toLowerCase()
          .includes(query)
      );

  }

  count(
    category: CatalogCategory
  ): number {

    return this.items
      .filter(item =>
        item.category === category
      )
      .length;

  }

  setFilter(
    filter: CatalogFilter
  ): void {

    this.selectedFilter =
      filter;

  }

  addItem(
    category: CatalogCategory
  ): void {

    this.selectedItem =
      null;

    this.draft =
      this.emptyDraft(category);

    this.formError = '';

    this.showForm =
      true;

  }

  editItem(
    item: CatalogItem
  ): void {

    this.selectedItem =
      item;

    this.draft = {
      ...item
    };

    this.formError = '';

    this.showForm =
      true;

  }

  closeForm(): void {

    this.showForm =
      false;

    this.formError = '';

  }

  saveItem(): void {

    if (
      !this.draft.code.trim() ||
      !this.draft.name.trim()
    ) {

      this.formError =
        'Completa codigo y descripcion.';

      return;

    }

    try {

      const savedItem =
        this.catalogService
          .saveItem(this.draft);

      this.refreshItems();

      this.editItem(
        savedItem
      );

      this.showForm =
        false;

    } catch (error) {

      this.formError =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar.';

    }

  }

  requestDelete(
    item: CatalogItem
  ): void {

    this.itemToDelete =
      item;

  }

  cancelDelete(): void {

    this.itemToDelete =
      null;

  }

  confirmDelete(): void {

    if (!this.itemToDelete) {
      return;
    }

    const deletedId =
      this.itemToDelete.id;

    this.catalogService
      .deleteItem(deletedId);

    this.refreshItems();

    if (
      this.selectedItem?.id === deletedId
    ) {
      this.selectedItem =
        null;

      this.draft =
        this.emptyDraft('service');

      this.showForm =
        false;
    }

    this.itemToDelete =
      null;

  }

  toggleItem(
    item: CatalogItem
  ): void {

    this.catalogService
      .setActive(
        item.id,
        !item.active
      );

    this.refreshItems();

    if (
      this.selectedItem?.id === item.id
    ) {
      this.editItem(
        this.items.find(current =>
          current.id === item.id
        ) as CatalogItem
      );
    }

  }

  categoryLabel(
    category: CatalogCategory
  ): string {

    return category === 'service'
      ? 'Servicio'
      : 'Reparacion';

  }

  trackByItem(
    _index: number,
    item: CatalogItem
  ): number {

    return item.id;

  }

  private refreshItems(): void {

    this.items =
      this.catalogService
        .getItems();

  }

  private emptyDraft(
    category: CatalogCategory
  ): Omit<CatalogItem, 'id'> {

    return {
      code: '',
      name: '',
      category,
      active: true
    };

  }

}
