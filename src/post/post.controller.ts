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
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth()
  async findAll(): Promise<ListData<Omit<PostEntity, 'token'>>> {
    const [posts, total] = await this.postService.findAllAndCount();
    return {
      list: posts,
      total,
    };
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
          title: 'Hôm nay bạn thấy thế nào?',
          description: 'Tổi bình thường',
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
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    return this.postService.create(createPostDto, req.user.sub);
  }
}
