import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';

import {
  CatalogCategory,
  CatalogItem
} from '../models/catalog-item';

import catalogSeed
from '../data/catalog-seed.json';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly storageKey =
    'turnero-chubut:catalog:v2';

  private readonly defaultItems:
    CatalogItem[] =
      catalogSeed as CatalogItem[];

  private itemsSubject =
    new BehaviorSubject<CatalogItem[]>(
      this.loadItems()
    );

  items$ =
    this.itemsSubject.asObservable();

  getItems(): CatalogItem[] {

    return this.cloneItems(
      this.itemsSubject.value
    );

  }

  getActiveItems(): CatalogItem[] {

    return this.getItems()
      .filter(item => item.active);

  }

  saveItem(
    entry: Omit<CatalogItem, 'id'>
      & { id?: number }
  ): CatalogItem {

    const items =
      this.getItems();

    const normalizedCode =
      entry.code.trim().toUpperCase();

    const normalizedName =
      entry.name.trim();

    const duplicate =
      items.find(item =>
        item.code === normalizedCode &&
        item.id !== entry.id
      );

    if (duplicate) {
      throw new Error(
        'Ya existe un item con ese codigo.'
      );
    }

    let savedItem: CatalogItem;

    if (entry.id) {

      savedItem = {
        id: entry.id,
        code: normalizedCode,
        name: normalizedName,
        category: entry.category,
        active: entry.active,
        sourceRubro:
          entry.sourceRubro
      };

      const index =
        items.findIndex(item =>
          item.id === entry.id
        );

      if (index === -1) {
        throw new Error(
          'El item no existe.'
        );
      }

      items[index] =
        savedItem;

    } else {

      savedItem = {
        id: this.nextId(items),
        code: normalizedCode,
        name: normalizedName,
        category: entry.category,
        active: entry.active,
        sourceRubro:
          entry.sourceRubro
      };

      items.unshift(
        savedItem
      );

    }

    this.updateItems(items);

    return savedItem;

  }

  setActive(
    id: number,
    active: boolean
  ): void {

    const items =
      this.getItems()
        .map(item => item.id === id
          ? {
              ...item,
              active
            }
          : item
        );

    this.updateItems(
      items
    );

  }

  deleteItem(
    id: number
  ): void {

    const items =
      this.getItems();

    const itemExists =
      items.some(item =>
        item.id === id
      );

    if (!itemExists) {
      throw new Error(
        'El item no existe.'
      );
    }

    this.updateItems(
      items.filter(item =>
        item.id !== id
      )
    );

  }

  countByCategory(
    category: CatalogCategory
  ): number {

    return this.itemsSubject.value
      .filter(item =>
        item.category === category
      )
      .length;

  }

  private loadItems(): CatalogItem[] {

    const rawItems =
      localStorage.getItem(
        this.storageKey
      );

    if (!rawItems) {
      return this.cloneItems(
        this.defaultItems
      );
    }

    try {

      const parsed =
        JSON.parse(rawItems) as CatalogItem[];

      return this.cloneItems(
        parsed
      );

    } catch {

      localStorage.removeItem(
        this.storageKey
      );

      return this.cloneItems(
        this.defaultItems
      );

    }

  }

  private updateItems(
    items: CatalogItem[]
  ): void {

    const clone =
      this.cloneItems(items);

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(clone)
    );

    this.itemsSubject.next(
      clone
    );

  }

  private cloneItems(
    items: CatalogItem[]
  ): CatalogItem[] {

    return items.map(item => ({
      ...item
    }));

  }

  private nextId(
    items: CatalogItem[]
  ): number {

    return Math.max(
      0,
      ...items.map(item => item.id)
    ) + 1;

  }

}
