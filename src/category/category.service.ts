import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryLevel } from './enum/category.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    creatorId: number,
  ): Promise<CategoryEntity> {
    const { parentCategoryIds } = createCategoryDto;

    const categoryLevel =
      parentCategoryIds && parentCategoryIds.length > 0
        ? CategoryLevel.CHILDREN
        : CategoryLevel.PARENT;

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      level: categoryLevel,
    });

    const creator = await this.userRepository.findOneBy({ id: creatorId });

    if (parentCategoryIds && parentCategoryIds.length > 0) {
      const parentCategories = await this.categoryRepository.findBy({
        id: In(parentCategoryIds),
      });
      category.parentCategories = parentCategories;
    }

    return await this.categoryRepository.save({ ...category, creator });
  }
  async findAllAndCount(): Promise<[CategoryEntity[], number]> {
    const [categories, total] = await this.categoryRepository.findAndCount();
    return [categories, total];
  }

  async update(
    id: number,
    updateUserDto: Partial<CategoryEntity>,
  ): Promise<CategoryEntity> {
    await this.categoryRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async findOne(id: number): Promise<CategoryEntity> {
    return this.categoryRepository.findOne({ where: { id } });
  }
}
