import fs from 'fs-extra';
import path from 'path';

const PROJECT_DIR = path.resolve(__dirname, '../../../web-applications/bob');
const LOG_FILE = path.join(PROJECT_DIR, 'bob.log');

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export class BobLogger {
  private static initialized = false;

  private static async init(): Promise<void> {
    if (this.initialized) return;
    await fs.ensureDir(PROJECT_DIR);
    if (!(await fs.pathExists(LOG_FILE))) {
      await fs.writeFile(LOG_FILE, '', 'utf8');
    }
    this.initialized = true;
  }

  static async log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.init();
    const timestamp = new Date().toISOString();
    const payload = context ? ` ${JSON.stringify(context)}` : '';
    const line = `[${timestamp}] [${level}] ${message}${payload}\n`;
    await fs.appendFile(LOG_FILE, line, 'utf8');
  }

  static info(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('INFO', message, context);
  }

  static warn(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('WARN', message, context);
  }

  static error(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('ERROR', message, context);
  }

  static debug(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('DEBUG', message, context);
  }
}

