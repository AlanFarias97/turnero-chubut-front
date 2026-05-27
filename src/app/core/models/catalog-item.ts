export type CatalogCategory =
  | 'service'
  | 'repair';

export interface CatalogItem {
  id: number;
  code: string;
  name: string;
  category: CatalogCategory;
  active: boolean;
  sourceRubro?: string;
}
