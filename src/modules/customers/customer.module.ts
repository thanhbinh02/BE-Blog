import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
