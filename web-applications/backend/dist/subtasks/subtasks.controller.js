"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubtasksController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_subtask_dto_1 = require("./dto/create-subtask.dto");
const update_subtask_dto_1 = require("./dto/update-subtask.dto");
const subtasks_service_1 = require("./subtasks.service");
let SubtasksController = class SubtasksController {
    subtasks;
    constructor(subtasks) {
        this.subtasks = subtasks;
    }
    async create(user, taskId, dto) {
        return await this.subtasks.create(user.userId, taskId, dto);
    }
    async update(user, id, dto) {
        return await this.subtasks.update(user.userId, id, dto);
    }
    async remove(user, id) {
        return await this.subtasks.remove(user.userId, id);
    }
};
exports.SubtasksController = SubtasksController;
__decorate([
    (0, common_1.Post)('tasks/:taskId/subtasks'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_subtask_dto_1.CreateSubtaskDto]),
    __metadata("design:returntype", Promise)
], SubtasksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('subtasks/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_subtask_dto_1.UpdateSubtaskDto]),
    __metadata("design:returntype", Promise)
], SubtasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('subtasks/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubtasksController.prototype, "remove", null);
exports.SubtasksController = SubtasksController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [subtasks_service_1.SubtasksService])
], SubtasksController);
//# sourceMappingURL=subtasks.controller.js.map