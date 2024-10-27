import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLevel } from './enum/category.enum';
import { TCategoryDetails } from './interface/category.interface';
import { FilterCategoryDto } from './dto/filter-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAllAndCount(
    filter: FilterCategoryDto,
  ): Promise<[CategoryEntity[], number]> {
    const { page = '1', perPage = '10', name, getFull } = filter;

    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const take = parseInt(perPage);

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (name) {
      queryBuilder.andWhere('category.name LIKE :name', { name: `%${name}%` });
    }

    if (getFull) {
      // Apply additional criteria if `getFull` is true
    }

    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }
  async create(
    createCategoryDto: CreateCategoryDto,
    creatorId: number,
  ): Promise<CategoryEntity> {
    const { parentCategoryIds } = createCategoryDto;

    const categoryLevel =
      parentCategoryIds && parentCategoryIds.length > 0
        ? CategoryLevel.CHILDREN
        : CategoryLevel.PARENT;

    const creator = await this.userRepository.findOneBy({ id: creatorId });

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      level: categoryLevel,
      creator,
      parentCategories: await this.getParentCategories(parentCategoryIds),
    });

    return this.categoryRepository.save(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<TCategoryDetails> {
    const { parentCategoryIds, ...categoryData } = updateCategoryDto;

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parentCategories'],
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    category.level =
      parentCategoryIds && parentCategoryIds.length > 0
        ? CategoryLevel.CHILDREN
        : CategoryLevel.PARENT;

    Object.assign(category, categoryData);
    category.parentCategories =
      await this.getParentCategories(parentCategoryIds);

    await this.categoryRepository.save(category);

    return this.formatCategoryDetails(category);
  }

  async findId(id: number): Promise<TCategoryDetails> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parentCategories'],
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return this.formatCategoryDetails(category);
  }

  private async getParentCategories(parentCategoryIds?: number[]) {
    return parentCategoryIds && parentCategoryIds.length > 0
      ? await this.categoryRepository.findBy({ id: In(parentCategoryIds) })
      : [];
  }

  private formatCategoryDetails(category: CategoryEntity): TCategoryDetails {
    return {
      ...category,
      parentCategories: category.parentCategories.map((parent) => ({
        id: parent.id,
        name: parent.name,
      })),
    };
  }
}
