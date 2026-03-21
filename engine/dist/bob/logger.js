"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BobLogger = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const PROJECT_DIR = path_1.default.resolve(__dirname, '../../../web-applications/bob');
const LOG_FILE = path_1.default.join(PROJECT_DIR, 'bob.log');
class BobLogger {
    static initialized = false;
    static async init() {
        if (this.initialized)
            return;
        await fs_extra_1.default.ensureDir(PROJECT_DIR);
        if (!(await fs_extra_1.default.pathExists(LOG_FILE))) {
            await fs_extra_1.default.writeFile(LOG_FILE, '', 'utf8');
        }
        this.initialized = true;
    }
    static async log(level, message, context) {
        await this.init();
        const timestamp = new Date().toISOString();
        const payload = context ? ` ${JSON.stringify(context)}` : '';
        const line = `[${timestamp}] [${level}] ${message}${payload}\n`;
        await fs_extra_1.default.appendFile(LOG_FILE, line, 'utf8');
    }
    static info(message, context) {
        return this.log('INFO', message, context);
    }
    static warn(message, context) {
        return this.log('WARN', message, context);
    }
    static error(message, context) {
        return this.log('ERROR', message, context);
    }
    static debug(message, context) {
        return this.log('DEBUG', message, context);
    }
}
exports.BobLogger = BobLogger;
