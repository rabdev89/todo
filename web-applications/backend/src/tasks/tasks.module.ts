import { Module } from '@nestjs/common';
import { FileModule } from '../files/file.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [FileModule],
  controllers: [TasksController],
  providers: [TasksService, AttachmentsService],
})
export class TasksModule {}
