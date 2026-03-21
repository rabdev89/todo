import { EnvironmentCode } from '../types';
interface InitOptions {
    environment?: EnvironmentCode[];
    all?: boolean;
    phases?: string;
}
export declare function initCommand(options: InitOptions): Promise<void>;
export {};
