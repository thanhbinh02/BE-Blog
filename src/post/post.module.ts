import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from './post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { CategoryEntity } from 'src/category/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, User, CategoryEntity]),
    UserModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
