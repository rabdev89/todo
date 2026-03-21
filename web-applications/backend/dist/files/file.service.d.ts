export interface FileDeleteResult {
    success: boolean;
    error?: string;
}
export declare class FileService {
    private readonly logger;
    private readonly uploadsDir;
    deleteFile(filePath: string): Promise<FileDeleteResult>;
    deleteFiles(filePaths: string[]): Promise<FileDeleteResult[]>;
    private resolveFilePath;
    fileExists(filePath: string): Promise<boolean>;
}
