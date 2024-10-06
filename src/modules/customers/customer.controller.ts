import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

import { Customer } from './interface/customer.interface';
import { ListData } from 'src/types';
import {
  UpdateCustomerDto,
  UpdatePasswordDto,
} from './dto/update-customer-dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List all customers.',
    schema: {
      example: {
        list: [
          {
            id: 1,
            fullName: 'John Doe',
            bio: 'Loves coding and coffee',
            gender: 1,
            dateOfBirth: '1990-01-01',
            phoneNumber: '123456789',
            email: 'email1@gmail.com',
          },
          {
            id: 2,
            fullName: 'Jane Smith',
            bio: 'Enjoys traveling and photography',
            gender: 2,
            dateOfBirth: '1992-02-02',
            phoneNumber: '987654321',
            email: 'email2@gmail.com',
          },
        ],
        total: 2,
      },
    },
  })
  async findAll(): Promise<ListData<Omit<Customer, 'password'>>> {
    const [customers, total] = await this.customerService.findAllAndCount();
    return {
      list: customers,
      total,
    };
  }

  @Post()
  @ApiBody({
    description: 'Create a new customer',
    schema: {
      example: {
        fullName: 'Đinh Thị Thanh Bình',
        bio: '55',
        gender: 2,
        dateOfBirth: '2024/10/17',
        phoneNumber: '0916364465',
        email: 'thanhbinh4@gmail.com',
        password: 'thanhbinh',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer created successfully',
    schema: {
      example: {
        statusCode: 201,
        message: 'Customer created successfully',
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    await this.customerService.create(createCustomerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Customer created successfully',
    };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Get customer details',
    schema: {
      example: {
        id: 1,
        fullName: 'John Doe',
        bio: 'Loves coding and coffee',
        gender: 1,
        dateOfBirth: '1990-01-01',
        phoneNumber: '123456789',
        email: 'email1@gmail.com',
      },
    },
  })
  async findId(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<Omit<Customer, 'password'>> {
    const customer = await this.customerService.findId(id);
    if (!customer) {
      throw new NotFoundException(`Không tìm thấy ${id}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...customerWithoutPassword } = customer;

    return customerWithoutPassword;
  }

  @Patch(':id')
  @ApiBody({
    description: 'Update customer',
    schema: {
      example: {
        fullName: 'Đinh Thị Thanh Bình',
        bio: '55',
        gender: 2,
        dateOfBirth: '2024/10/17',
        phoneNumber: '0916364465',
        email: 'thanhbinh4@gmail.com',
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const updatedCustomer = await this.customerService.update(
      id,
      updateCustomerDto,
    );
    return updatedCustomer;
  }

  @Patch(':id/password')
  @ApiBody({
    description: 'Update password of customer',
    schema: {
      example: {
        password: '*****',
        newPassword: '*******',
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.customerService.updatePassword(id, updatePasswordDto);
    return {
      message: 'Cập nhật mật khẩu thành công',
    };
  }
}
