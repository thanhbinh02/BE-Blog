import { IsNotEmpty, Length, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title cannot be blank' })
  @Length(1, 1000, {
    message: 'Title must be between 1 and 1000 characters',
  })
  title: string;

  @IsNotEmpty({ message: 'Description cannot be blank' })
  @Length(1, 1000, {
    message: 'Description must be between 1 and 1000 characters',
  })
  description: string;

  @IsNotEmpty({ message: 'Category cannot be blank' })
  @IsInt({ message: 'Category must be an integer' })
  categoryId: number;
}
