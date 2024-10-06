import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(8, undefined, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^\S*$/, { message: 'Mật khẩu không được chứa khoảng trắng' })
  password: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(8, undefined, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^\S*$/, { message: 'Mật khẩu không được chứa khoảng trắng' })
  newPassword: string;
}
