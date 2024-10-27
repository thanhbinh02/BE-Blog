import { CategoryEntity } from '../category.entity';

export type TCategoryDetails = Omit<CategoryEntity, 'parentCategories'> & {
  parentCategories: { id: number; name: string }[];
};
