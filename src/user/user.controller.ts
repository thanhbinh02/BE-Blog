import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListData } from 'src/types';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth()
  async findAll(): Promise<ListData<Omit<User, 'password' | 'token'>>> {
    const [customers, total] = await this.userService.findAllAndCount();
    return {
      list: customers,
      total,
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBody({
    description: 'Create user data',
    type: CreateUserDto,
    examples: {
      user: {
        value: {
          email: 'thanhbinh@gmail.com',
          fullName: 'Thanh Binh',
          password: 'thanhbinh',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 201 },
        message: { type: 'string', example: 'Customer created successfully' },
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Customer created successfully',
    };
  }
}
