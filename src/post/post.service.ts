import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './post.entity';
import { User } from 'src/user/user.entity';
import { CategoryEntity } from 'src/category/category.entity';
import { FilterPostDto } from './dto/filter-post.dto';
import { ListData } from 'src/types';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findAllAndCount(
    filter: FilterPostDto,
  ): Promise<Promise<ListData<PostEntity>>> {
    const page = filter.page || 1;
    const perPage = filter.perPage || 10;
    const title = filter?.title?.trim() || '';
    const skip = (page - 1) * perPage;

    const whereConditions = title ? [{ title: Like(`%${title}%`) }] : [];

    const totalCount = await this.postRepository.count({
      where: whereConditions,
    });

    const [res, total] = await this.postRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      take: filter.getFull ? totalCount : perPage,
      skip: filter.getFull ? 0 : skip,
      relations: ['creator', 'category'],
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          id: true,
          fullName: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });

    return {
      list: res,
      total,
      page,
      perPage,
    };
  }

  async create(
    createPostDto: CreatePostDto,
    creatorId: number,
  ): Promise<PostEntity> {
    const { categoryId, ...postData } = createPostDto;

    const creator = await this.userRepository.findOneBy({ id: creatorId });
    if (!creator) {
      throw new NotFoundException(`User with ID ${creatorId} not found`);
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const post = this.postRepository.create({
      ...postData,
      creator,
      category,
    });

    return await this.postRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    console.log('id', id);

    const post = await this.postRepository.findOne({ where: { id } });
    console.log('post', post);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    Object.assign(post, updatePostDto);

    return await this.postRepository.save(post);
  }

  async findOne(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['creator', 'category'],
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          id: true,
          fullName: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
    if (!post) {
      throw new NotFoundException(`Pót with id ${id} not found`);
    }

    return post;
  }
}
