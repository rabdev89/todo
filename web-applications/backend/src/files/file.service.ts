import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileDeleteResult {
  success: boolean;
  error?: string;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  /**
   * Delete a file from local storage
   * @param filePath URL or file path to delete
   * @returns Result object with success status
   */
  async deleteFile(filePath: string): Promise<FileDeleteResult> {
    try {
      // Handle both URL and direct file paths
      const actualPath = this.resolveFilePath(filePath);

      // Verify file exists before attempting deletion
      try {
        await fs.access(actualPath);
      } catch {
        this.logger.warn(`File not found for deletion: ${actualPath}`);
        return { success: false, error: 'File not found' };
      }

      // Delete the file
      await fs.unlink(actualPath);
      this.logger.debug(`File deleted: ${actualPath}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to delete file: ${filePath}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete multiple files from local storage
   * @param filePaths Array of URLs or file paths
   * @returns Array of result objects
   */
  async deleteFiles(filePaths: string[]): Promise<FileDeleteResult[]> {
    const results = await Promise.all(
      filePaths.map((path) => this.deleteFile(path)),
    );
    return results;
  }

  /**
   * Resolve file URL or path to actual filesystem path
   * @param filePath URL or relative path
   * @returns Absolute filesystem path
   */
  private resolveFilePath(filePath: string): string {
    // If it's a URL starting with /uploads/, extract filename
    if (filePath.startsWith('/uploads/')) {
      return path.join(this.uploadsDir, filePath.slice('/uploads/'.length));
    }

    // If it's already an absolute path, use it
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // Otherwise treat as relative to uploads directory
    return path.join(this.uploadsDir, filePath);
  }

  /**
   * Check if file exists (for validation)
   * @param filePath URL or file path
   * @returns True if file exists, false otherwise
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const actualPath = this.resolveFilePath(filePath);
      await fs.access(actualPath);
      return true;
    } catch {
      return false;
    }
  }
}
