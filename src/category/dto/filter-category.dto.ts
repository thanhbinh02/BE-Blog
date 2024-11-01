import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { CategoryLevel } from '../enum/category.enum';

export class FilterCategoryDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  perPage?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  getFull?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  level?: CategoryLevel;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsString()
  createdAtFrom?: string;

  @IsOptional()
  @IsString()
  createdAtTo?: string;
}
