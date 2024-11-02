import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ListData } from 'src/types';
import { User } from 'src/user/user.entity';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLevel } from './enum/category.enum';
import { TCategoryDetails } from './interface/category.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAllAndCount(
    filter: FilterCategoryDto,
  ): Promise<ListData<CategoryEntity>> {
    const {
      page = 1,
      perPage = 10,
      getFull,
      name,
      parentName,
      level,
      createdAtFrom,
      createdAtTo,
      id,
    } = filter;

    const skip = (page - 1) * perPage;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.creator', 'creator')
      .leftJoinAndSelect('category.parentCategories', 'parentCategory')
      .orderBy('category.createdAt', 'DESC');

    if (id) {
      queryBuilder.andWhere('category.id = :id', { id });
    }

    if (name) {
      queryBuilder.andWhere('category.name LIKE :name', {
        name: `%${name.trim()}%`,
      });
    }

    if (level && level in CategoryLevel) {
      queryBuilder.andWhere('category.level = :level', { level });
    }

    if (parentName) {
      queryBuilder.andWhere('parentCategory.name LIKE :parentName', {
        parentName: `%${parentName.trim()}%`,
      });
    }

    if (createdAtFrom) {
      queryBuilder.andWhere('category.createdAt >= :createdAtFrom', {
        createdAtFrom: `${createdAtFrom} 00:00:00`,
      });
    }

    if (createdAtTo) {
      queryBuilder.andWhere('category.createdAt <= :createdAtTo', {
        createdAtTo: `${createdAtTo} 23:59:59`,
      });
    }

    const totalCount = await queryBuilder.getCount();

    if (!getFull) {
      queryBuilder.skip(skip).take(perPage);
    }

    const [res] = await queryBuilder.getManyAndCount();

    return {
      list: res,
      total: totalCount,
      page,
      perPage,
    };
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

    if (category.level === CategoryLevel.CHILDREN) {
      const childCategories = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.parentCategories', 'parent')
        .where('parent.id = :categoryId', { categoryId: id })
        .getMany();

      for (const childCategory of childCategories) {
        childCategory.parentCategories = childCategory.parentCategories.filter(
          (parent) => parent.id !== id,
        );

        await this.categoryRepository.save(childCategory);
      }
    }

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
