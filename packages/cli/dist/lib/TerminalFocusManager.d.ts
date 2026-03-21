export interface TerminalLocation {
    type: 'tmux' | 'iterm2' | 'terminal-app' | 'unknown';
    identifier: string;
    tty: string;
}
export declare class TerminalFocusManager {
    /**
     * Find the terminal location (emulator info) for a given process ID
     */
    findTerminal(pid: number): Promise<TerminalLocation | null>;
    /**
     * Focus the terminal identified by the location
     */
    focusTerminal(location: TerminalLocation): Promise<boolean>;
    private findTmuxPane;
    private findITerm2Session;
    private findTerminalAppWindow;
    private focusTmuxPane;
    private focusITerm2Session;
    private focusTerminalAppWindow;
}
