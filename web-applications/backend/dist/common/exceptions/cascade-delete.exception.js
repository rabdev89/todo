"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CascadeDeleteException = void 0;
const common_1 = require("@nestjs/common");
class CascadeDeleteException extends common_1.HttpException {
    details;
    constructor(message = 'Failed to delete task and related resources', details) {
        super({
            message,
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            details,
        }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        this.details = details;
    }
}
exports.CascadeDeleteException = CascadeDeleteException;
//# sourceMappingURL=cascade-delete.exception.js.map