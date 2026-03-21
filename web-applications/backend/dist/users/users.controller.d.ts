import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(user: {
        userId: string;
        email: string;
    }): Promise<{
        userId: string;
        email: string;
        displayName: string | null;
    }>;
}
