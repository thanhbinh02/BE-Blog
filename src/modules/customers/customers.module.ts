import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomerService } from './customers.service';
import { Customer } from './customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomersModule {}
