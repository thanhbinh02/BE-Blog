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
import { AuthGuard } from 'src/auth/auth.guard';
import { ListData } from 'src/types';
import { CreatePostDto } from './dto/create-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './post.entity';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'getFull', required: false, type: Boolean })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  async findAll(
    @Query() filter: FilterPostDto,
  ): Promise<ListData<Omit<PostEntity, 'token'>>> {
    return await this.postService.findAllAndCount(filter);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBody({
    description: 'Create post data',
    type: CreatePostDto,
    examples: {
      user: {
        value: {
          title: 'How are you?',
          description: 'Bad',
          categoryId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 201 },
        message: { type: 'string', example: 'Post created successfully' },
      },
    },
  })
  async create(
    @Body() body: CreatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    return this.postService.create(body, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Update category',
    schema: {
      example: {
        title: 'How are you?',
        description: 'Bad',
        categoryId: 1,
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.update(id, body);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Get customer details',
    schema: {
      example: {
        id: 4,
        title: 'How are you44?',
        description: 'Bad',
        createdAt: '2024-10-28T13:34:41.697Z',
        updatedAt: '2024-10-28T14:07:01.922Z',
        creator: {
          id: 1,
          fullName: 'Đinh Thị Thanh Bình',
        },
        category: {
          id: 1,
          name: 'ReactJs',
        },
      },
    },
  })
  async findId(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<PostEntity> {
    return this.postService.findOne(id);
  }
}
