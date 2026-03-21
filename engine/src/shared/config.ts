import path from 'path';
import fs from 'fs-extra';

export interface BobConfigData {
  directories: {
    project_management: string;
    epics: string;
    dashboard: string;
    framework: string;
    web_apps: string;
    [key: string]: string;
  };
  patterns: {
    metadata_filename: string;
    default_branch: string;
    ticket_id_prefix: string;
    [key: string]: string;
  };
}

export class BobConfig {
  private static instance: BobConfig;
  private config: BobConfigData;
  private rootDir: string;

  private constructor() {
    this.rootDir = ''; // Initialize
    // Dynamic root discovery: Walk up from __dirname until we find bob.config.json
    let current = __dirname;
    let found = false;
    
    while (current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, 'bob.config.json'))) {
        this.rootDir = current;
        found = true;
        break;
      }
      current = path.dirname(current);
    }
    
    // Fallback to old behavior if not found (standard repo structure)
    if (!found) {
      this.rootDir = path.resolve(__dirname, '../../..');
    }

    const configPath = path.join(this.rootDir, 'bob.config.json');
    
    if (fs.existsSync(configPath)) {
      this.config = fs.readJsonSync(configPath);
    } else {
      // Default fallback for backward compatibility
      this.config = {
        directories: {
          project_management: 'web-applications/project-management',
          epics: 'web-applications/project-management/epics',
          dashboard: 'web-applications/bob',
          framework: 'framework',
          web_apps: 'web-applications'
        },
        patterns: {
          metadata_filename: 'metadata.json',
          default_branch: 'main',
          ticket_id_prefix: 'T-'
        }
      };
    }
  }

  public static getInstance(): BobConfig {
    if (!BobConfig.instance) {
      BobConfig.instance = new BobConfig();
    }
    return BobConfig.instance;
  }

  /**
   * Resolve a logical directory key to an absolute path
   */
  public getDirectory(key: string): string {
    const dir = (this.config.directories as any)[key] || '';
    return dir;
  }

  /**
   * Get a pattern value
   */
  public getPattern(key: string): string {
    return (this.config.patterns as any)[key] || '';
  }

  /**
   * Get the root directory of the workspace
   */
  public getRootDir(): string {
    return this.rootDir;
  }
}
