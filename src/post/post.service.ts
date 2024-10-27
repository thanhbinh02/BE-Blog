import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './post.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    creatorId: number,
  ): Promise<PostEntity> {
    const post = this.postRepository.create(createPostDto);
    const creator = await this.userRepository.findOneBy({ id: creatorId });

    return await this.postRepository.save({ ...post, creator });
  }

  async findAllAndCount(): Promise<[PostEntity[], number]> {
    const [posts, total] = await this.postRepository.findAndCount();

    return [posts, total];
  }

  async update(
    id: number,
    updateUserDto: Partial<PostEntity>,
  ): Promise<PostEntity> {
    await this.postRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async findOne(id: number): Promise<PostEntity> {
    return this.postRepository.findOne({ where: { id } });
  }
}
