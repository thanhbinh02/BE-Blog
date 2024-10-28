import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterPostDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => parseInt(value, 10))
  perPage?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  getFull?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  categoryId?: number;
}
