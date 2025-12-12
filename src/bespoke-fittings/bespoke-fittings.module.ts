import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BespokeFittingsController } from './bespoke-fittings.controller';
import { BespokeFittingsService } from './bespoke-fittings.service';
import { BespokeFitting, BespokeFittingSchema } from '../schemas/bespoke-fitting.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: BespokeFitting.name, schema: BespokeFittingSchema }])],
  controllers: [BespokeFittingsController],
  providers: [BespokeFittingsService],
  exports: [BespokeFittingsService],
})
export class BespokeFittingsModule {}

