import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FilterCategoryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  perPage?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  getFull?: boolean;
}
