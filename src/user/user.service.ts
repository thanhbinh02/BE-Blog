import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUserByFullName = await this.userRepository.findOne({
      where: { fullName: createUserDto.fullName },
    });
    if (existingUserByFullName) {
      throw new ConflictException({ message: 'Name already exists' });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }

  async findAllAndCount(): Promise<
    [Omit<User, 'password' | 'token'>[], number]
  > {
    const [customers, total] = await this.userRepository.findAndCount();

    const customersWithoutPassword = customers.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password, token, ...rest }) => rest,
    );

    return [customersWithoutPassword, total];
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }
}
