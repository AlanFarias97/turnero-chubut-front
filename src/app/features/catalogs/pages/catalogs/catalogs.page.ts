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
  Router,
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

import {
  AuthService
} from 'src/app/core/auth/auth.service';

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

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  userEmail =
    this.authService.userEmail;

  isAdmin =
    this.authService.isAdmin;

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

  isLoading = false;

  ngOnInit(): void {

    this.refreshItems();

  }

  logout(): void {

    this.authService.logout();

    this.router.navigateByUrl('/login');

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

    this.catalogService
      .saveItem(this.draft)
      .subscribe({
        next: savedItem => {
          this.refreshItems();

          this.editItem(
            savedItem
          );

          this.showForm =
            false;
        },
        error: response => {
          this.formError =
            response?.status === 409
              ? 'Ya existe un item con ese codigo.'
              : 'No se pudo guardar.';
        }
      });

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
      .deleteItem(deletedId)
      .subscribe({
        next: () => {
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
        },
        error: () => {
          this.formError =
            'No se pudo borrar el item.';

          this.itemToDelete =
            null;
        }
      });

  }

  toggleItem(
    item: CatalogItem
  ): void {

    this.catalogService
      .setActive(
        item.id,
        !item.active
      )
      .subscribe({
        next: updatedItem => {
          this.refreshItems();

          if (
            this.selectedItem?.id === item.id
          ) {
            this.editItem(
              updatedItem
            );
          }
        },
        error: () => {
          this.formError =
            'No se pudo cambiar el estado del item.';
        }
      });

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

    this.isLoading =
      true;

    this.catalogService
      .refreshFromApi()
      .subscribe({
        next: items => {
          this.items =
            items;

          this.isLoading =
            false;
        },
        error: () => {
          this.isLoading =
            false;
        }
      });

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
