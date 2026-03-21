import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { AttachmentsService } from './attachments.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    private readonly attachments: AttachmentsService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTaskDto,
  ) {
    return await this.tasks.create(user.userId, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: { userId: string }) {
    return await this.tasks.findAll(user.userId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return await this.tasks.update(user.userId, id, dto);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addAttachment(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.attachments.addAttachment(user.userId, id, file);
  }

  @Delete('attachments/:id')
  async removeAttachment(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return await this.attachments.removeAttachment(user.userId, id);
  }

  @Patch('bulk')
  async bulkUpdate(
    @CurrentUser() user: { userId: string },
    @Body() body: { ids: string[]; updates: UpdateTaskDto },
  ) {
    return await this.tasks.bulkUpdate(user.userId, body.ids, body.updates);
  }

  @Delete('bulk')
  async bulkRemove(
    @CurrentUser() user: { userId: string },
    @Body() body: { ids: string[] },
  ) {
    return await this.tasks.bulkRemove(user.userId, body.ids);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return await this.tasks.remove(user.userId, id);
  }
}
