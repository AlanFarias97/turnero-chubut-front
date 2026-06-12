import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap
} from 'rxjs';

import {
  environment
} from 'src/environments/environment';

import {
  CatalogCategory,
  CatalogItem
} from '../models/catalog-item';

import catalogSeed
from '../data/catalog-seed.json';

type CatalogItemRequest =
  Omit<CatalogItem, 'id'>
  & { id?: number };

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/catalogs`;

  private readonly storageKey =
    'turnero-chubut:catalog:api-cache:v1';

  private readonly defaultItems:
    CatalogItem[] =
      catalogSeed as CatalogItem[];

  private itemsSubject =
    new BehaviorSubject<CatalogItem[]>(
      this.loadCachedItems()
    );

  items$ =
    this.itemsSubject.asObservable();

  refreshFromApi(): Observable<CatalogItem[]> {

    return this.http
      .get<CatalogItem[]>(
        this.apiUrl
      )
      .pipe(
        tap(items =>
          this.updateItems(items)
        ),
        catchError(() =>
          of(this.getItems())
        )
      );

  }

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
    entry: CatalogItemRequest
  ): Observable<CatalogItem> {

    const request =
      this.normalizeRequest(entry);

    const action =
      entry.id
        ? this.http.put<CatalogItem>(
            `${this.apiUrl}/${entry.id}`,
            request
          )
        : this.http.post<CatalogItem>(
            this.apiUrl,
            request
          );

    return action.pipe(
      tap(savedItem =>
        this.upsertItem(savedItem)
      )
    );

  }

  setActive(
    id: number,
    active: boolean
  ): Observable<CatalogItem> {

    return this.http
      .patch<CatalogItem>(
        `${this.apiUrl}/${id}/active`,
        { active }
      )
      .pipe(
        tap(updatedItem =>
          this.upsertItem(updatedItem)
        )
      );

  }

  deleteItem(
    id: number
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        tap(() => {
          this.updateItems(
            this.getItems()
              .filter(item =>
                item.id !== id
              )
          );
        })
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

  private normalizeRequest(
    entry: CatalogItemRequest
  ): Omit<CatalogItem, 'id'> {

    return {
      code:
        entry.code.trim().toUpperCase(),
      name:
        entry.name.trim(),
      category:
        entry.category,
      active:
        entry.active,
      sourceRubro:
        entry.sourceRubro?.trim() || undefined
    };

  }

  private upsertItem(
    savedItem: CatalogItem
  ): void {

    const items =
      this.getItems();

    const index =
      items.findIndex(item =>
        item.id === savedItem.id
      );

    if (index === -1) {
      this.updateItems([
        savedItem,
        ...items
      ]);

      return;
    }

    items[index] =
      savedItem;

    this.updateItems(items);

  }

  private loadCachedItems(): CatalogItem[] {

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
}
