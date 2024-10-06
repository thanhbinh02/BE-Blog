import { CustomerGender } from '../enum/customer.enum';

export interface Customer {
  fullName: string;
  bio?: string;
  gender: CustomerGender;
  dateOfBirth: Date;
  phoneNumber: string;
  password: string;
}
