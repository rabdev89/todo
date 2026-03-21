type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export declare class BobLogger {
    private static initialized;
    private static init;
    static log(level: LogLevel, message: string, context?: Record<string, unknown>): Promise<void>;
    static info(message: string, context?: Record<string, unknown>): Promise<void>;
    static warn(message: string, context?: Record<string, unknown>): Promise<void>;
    static error(message: string, context?: Record<string, unknown>): Promise<void>;
    static debug(message: string, context?: Record<string, unknown>): Promise<void>;
}
export {};
//# sourceMappingURL=logger.d.ts.map