import { Injectable } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerGender } from './enum/customer.enum';

@Injectable()
export class CustomerSeeder {
  constructor(private readonly customerService: CustomerService) {}

  async seed() {
    const existingCustomers = await this.customerService.findAll();

    if (existingCustomers.length === 0) {
      const customers: CreateCustomerDto[] = [
        {
          fullName: 'John Doe',
          bio: 'Loves coding and coffee',
          gender: CustomerGender.MALE,
          dateOfBirth: '1990-01-01',
          phoneNumber: '123456789',
          email: 'email1@gmail.com',
          password: 'securepassword1',
        },
        {
          fullName: 'Jane Smith',
          bio: 'Enjoys traveling and photography',
          gender: CustomerGender.FEMALE,
          dateOfBirth: '1992-02-02',
          phoneNumber: '987654321',
          email: 'email2@gmail.com',
          password: 'securepassword2',
        },
      ];

      for (const customer of customers) {
        await this.customerService.create(customer);
      }
    }
  }
}
