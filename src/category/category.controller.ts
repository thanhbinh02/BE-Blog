import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListData } from 'src/types';

import { AuthGuard } from 'src/auth/auth.guard';
import { CategoryEntity } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TCategoryDetails } from './interface/category.interface';
import { FilterCategoryDto } from './dto/filter-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'The page number for pagination',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: String,
    description: 'The number of items per page for pagination',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter categories by name',
  })
  @ApiQuery({
    name: 'getFull',
    required: false,
    type: Boolean,
    description: 'Fetch all categories if true',
  })
  async findAll(
    @Query() filter: FilterCategoryDto,
  ): Promise<ListData<CategoryEntity>> {
    return this.categoryService.findAllAndCount(filter);
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

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Get customer details',
    schema: {
      example: {
        id: 4,
        name: 'Java',
        level: 2,
        createdAt: '2024-10-27T11:38:39.670Z',
        updatedAt: '2024-10-27T11:38:39.670Z',
        parentCategories: [
          {
            id: 1,
            name: 'ReactJs',
          },
          {
            id: 2,
            name: 'NodeJs',
          },
        ],
      },
    },
  })
  async findId(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<TCategoryDetails> {
    return this.categoryService.findId(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Update category',
    schema: {
      example: {
        name: 'ReactJs',
        parentCategoryIds: [1],
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ): Promise<TCategoryDetails> {
    const updatedCategory = await this.categoryService.update(id, body);
    return updatedCategory;
  }
}
