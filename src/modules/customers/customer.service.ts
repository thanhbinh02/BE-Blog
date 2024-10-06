import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';
import {
  UpdateCustomerDto,
  UpdatePasswordDto,
} from './dto/update-customer-dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existingCustomerByEmail = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomerByEmail) {
      throw new ConflictException({ message: 'Email đã tồn tại' });
    }

    const existingCustomerByPhoneNumber = await this.customerRepository.findOne(
      {
        where: { phoneNumber: createCustomerDto.phoneNumber },
      },
    );

    if (existingCustomerByPhoneNumber) {
      throw new ConflictException({ message: 'Số điện thoại đã tồn tại' });
    }
    const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      password: hashedPassword,
    });
    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async findId(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Không tìm thấy ${id}`);
    }
    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customerToUpdate = await this.findId(id);

    if (updateCustomerDto.email) {
      const existingCustomerByEmail = await this.customerRepository.findOne({
        where: {
          email: updateCustomerDto.email,
          id: Not(id),
        },
      });

      if (existingCustomerByEmail) {
        throw new ConflictException({ message: 'Email đã tồn tại' });
      }
    }

    if (updateCustomerDto.phoneNumber) {
      const existingCustomerByPhoneNumber =
        await this.customerRepository.findOne({
          where: {
            phoneNumber: updateCustomerDto.phoneNumber,
            id: Not(id),
          },
        });

      if (existingCustomerByPhoneNumber) {
        throw new ConflictException({ message: 'Số điện thoại đã tồn tại' });
      }
    }

    Object.assign(customerToUpdate, updateCustomerDto);
    return this.customerRepository.save(customerToUpdate);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findId(id);
    await this.customerRepository.delete(customer.id);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { email } });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { phoneNumber } });
  }

  async findAllAndCount(): Promise<[Omit<Customer, 'password'>[], number]> {
    const [customers, total] = await this.customerRepository.findAndCount();

    // Map customers to exclude password
    const customersWithoutPassword = customers.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password, ...rest }) => rest,
    );

    return [customersWithoutPassword, total];
  }
  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<Customer> {
    const customer = await this.findId(id);

    const isPasswordMatching = await bcrypt.compare(
      updatePasswordDto.password,
      customer.password,
    );
    if (!isPasswordMatching) {
      throw new ConflictException('Mật khẩu hiện tại không đúng');
    }

    const isSamePassword = await bcrypt.compare(
      updatePasswordDto.newPassword,
      customer.password,
    );

    if (isSamePassword) {
      throw new ConflictException(
        'Vui lòng nhập mật khẩu không trùng với mật khẩu cũ',
      );
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    customer.password = hashedNewPassword;
    return this.customerRepository.save(customer);
  }
}
