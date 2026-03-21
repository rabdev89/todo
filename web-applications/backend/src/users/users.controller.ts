import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: { userId: string; email: string }) {
    const profile = await this.usersService.findProfileById(user.userId);
    return {
      userId: user.userId,
      email: user.email,
      displayName: profile?.displayName ?? null,
    };
  }
}
