import { IsNotEmpty, Length, IsArray, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Category name cannot be blank' })
  @Length(1, 100, {
    message: 'Category name must be between 1 and 100 characters',
  })
  name: string;

  @IsArray({ message: 'Parent category IDs must be an array' })
  @IsOptional()
  parentCategoryIds?: number[];
}
