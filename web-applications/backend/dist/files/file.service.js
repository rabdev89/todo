"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var FileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let FileService = FileService_1 = class FileService {
    logger = new common_1.Logger(FileService_1.name);
    uploadsDir = path.join(process.cwd(), 'uploads');
    async deleteFile(filePath) {
        try {
            const actualPath = this.resolveFilePath(filePath);
            try {
                await fs.access(actualPath);
            }
            catch {
                this.logger.warn(`File not found for deletion: ${actualPath}`);
                return { success: false, error: 'File not found' };
            }
            await fs.unlink(actualPath);
            this.logger.debug(`File deleted: ${actualPath}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${filePath}`, error instanceof Error ? error.message : 'Unknown error');
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async deleteFiles(filePaths) {
        const results = await Promise.all(filePaths.map((path) => this.deleteFile(path)));
        return results;
    }
    resolveFilePath(filePath) {
        if (filePath.startsWith('/uploads/')) {
            return path.join(this.uploadsDir, filePath.slice('/uploads/'.length));
        }
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.join(this.uploadsDir, filePath);
    }
    async fileExists(filePath) {
        try {
            const actualPath = this.resolveFilePath(filePath);
            await fs.access(actualPath);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.FileService = FileService;
exports.FileService = FileService = FileService_1 = __decorate([
    (0, common_1.Injectable)()
], FileService);
//# sourceMappingURL=file.service.js.map