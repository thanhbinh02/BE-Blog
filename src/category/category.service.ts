import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLevel } from './enum/category.enum';
import { TCategoryDetails } from './interface/category.interface';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { ListData } from 'src/types';

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
    const page = Number(filter.page) || 1;
    const perPage = Number(filter.perPage) || 10;
    const name = filter?.name?.trim() || '';
    const skip = (page - 1) * perPage;

    const whereConditions = name ? [{ name: Like(`%${name}%`) }] : [];

    const totalCount = await this.categoryRepository.count({
      where: whereConditions,
    });

    const getFull = String(filter.getFull) === 'true';

    const [res, total] = await this.categoryRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      take: getFull ? totalCount : perPage,
      skip: getFull ? 0 : skip,
      relations: ['creator', 'parentCategories'],
      select: {
        id: true,
        name: true,
        level: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          id: true,
          fullName: true,
        },
        parentCategories: {
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
