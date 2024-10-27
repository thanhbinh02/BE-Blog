import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryLevel } from './enum/category.enum';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: CategoryLevel })
  level: CategoryLevel;

  @ManyToMany(() => CategoryEntity, (category) => category.subcategories, {
    nullable: true,
  })
  @JoinTable({
    name: 'category_parents',
    joinColumn: {
      name: 'categoryId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'parentCategoryId',
      referencedColumnName: 'id',
    },
  })
  parentCategories: CategoryEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.parentCategories)
  subcategories: CategoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}
