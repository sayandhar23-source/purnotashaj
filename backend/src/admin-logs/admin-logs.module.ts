import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminLogsService } from './admin-logs.service';
import { AdminLogsController } from './admin-logs.controller';
import { RegistrationLog, RegistrationLogSchema } from '../common/schemas/registration-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RegistrationLog.name, schema: RegistrationLogSchema }]),
  ],
  controllers: [AdminLogsController],
  providers: [AdminLogsService],
})
export class AdminLogsModule {}
