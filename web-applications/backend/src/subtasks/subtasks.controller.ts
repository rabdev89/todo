import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtasksService } from './subtasks.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class SubtasksController {
  constructor(private readonly subtasks: SubtasksService) {}

  @Post('tasks/:taskId/subtasks')
  async create(
    @CurrentUser() user: { userId: string },
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    return await this.subtasks.create(user.userId, taskId, dto);
  }

  @Patch('subtasks/:id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return await this.subtasks.update(user.userId, id, dto);
  }

  @Delete('subtasks/:id')
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return await this.subtasks.remove(user.userId, id);
  }
}
