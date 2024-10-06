import { IsEmail, IsEnum, IsNotEmpty, Length, Matches } from 'class-validator';
import { CustomerGender } from '../enum/customer.enum';

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  fullName: string;

  bio?: string;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsEnum(CustomerGender, {
    message: 'Giới tính phải là một trong các giá trị nam, nữ hoặc khác',
  })
  gender: CustomerGender;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  dateOfBirth: string;

  @Length(10, 10, { message: 'Số điện thoại phải có 10 ký tự' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  phoneNumber: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(8, undefined, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^\S*$/, { message: 'Mật khẩu không được chứa khoảng trắng' })
  password: string;
}
