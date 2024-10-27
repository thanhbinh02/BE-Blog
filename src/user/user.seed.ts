import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Injectable()
export class UserSeeder {
  constructor(private readonly userService: UserService) {}

  async seed() {
    const existingUsers = await this.userService.findAll();

    if (existingUsers.length === 0) {
      const customers: CreateUserDto[] = [
        {
          fullName: 'Đinh Thị Thanh Bình',
          email: 'email1@gmail.com',
          password: 'securepassword1',
        },
      ];

      for (const customer of customers) {
        await this.userService.create(customer);
      }
    }
  }
}
