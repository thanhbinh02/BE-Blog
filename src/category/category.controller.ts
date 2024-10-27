import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListData } from 'src/types';

import { AuthGuard } from 'src/auth/auth.guard';
import { CategoryService } from './category.service';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth()
  async findAll(): Promise<ListData<CategoryEntity>> {
    const [categories, total] = await this.categoryService.findAllAndCount();
    return {
      list: categories,
      total,
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBody({
    description: 'Create post data',
    type: CreateCategoryDto,
    examples: {
      user: {
        value: {
          name: 'ReactJs',
          parentCategoryIds: [1],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 201 },
        message: { type: 'string', example: 'Category created successfully' },
      },
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req,
  ): Promise<CategoryEntity> {
    return this.categoryService.create(createCategoryDto, req.user.sub);
  }
}
