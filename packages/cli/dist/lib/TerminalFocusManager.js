"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalFocusManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const process_1 = require("../util/process");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class TerminalFocusManager {
    /**
     * Find the terminal location (emulator info) for a given process ID
     */
    async findTerminal(pid) {
        const ttyShort = (0, process_1.getProcessTty)(pid);
        // If no TTY or invalid, we can't find the terminal
        if (!ttyShort || ttyShort === '?') {
            return null;
        }
        const fullTty = `/dev/${ttyShort}`;
        // 1. Check tmux (most specific if running inside it)
        const tmuxLocation = await this.findTmuxPane(fullTty);
        if (tmuxLocation)
            return tmuxLocation;
        // 2. Check iTerm2
        const itermLocation = await this.findITerm2Session(fullTty);
        if (itermLocation)
            return itermLocation;
        // 3. Check Terminal.app
        const terminalAppLocation = await this.findTerminalAppWindow(fullTty);
        if (terminalAppLocation)
            return terminalAppLocation;
        // 4. Fallback: we know the TTY but not the emulator wrapper
        return {
            type: 'unknown',
            identifier: '',
            tty: fullTty
        };
    }
    /**
     * Focus the terminal identified by the location
     */
    async focusTerminal(location) {
        try {
            switch (location.type) {
                case 'tmux':
                    return await this.focusTmuxPane(location.identifier);
                case 'iterm2':
                    return await this.focusITerm2Session(location.tty);
                case 'terminal-app':
                    return await this.focusTerminalAppWindow(location.tty);
                default:
                    return false;
            }
        }
        catch (error) {
            return false;
        }
    }
    async findTmuxPane(tty) {
        try {
            // List all panes with their TTYs and identifiers
            // Format: /dev/ttys001|my-session:1.1
            // using | as separator to handle spaces in session names
            const { stdout } = await execAsync("tmux list-panes -a -F '#{pane_tty}|#{session_name}:#{window_index}.#{pane_index}'");
            const lines = stdout.trim().split('\n');
            for (const line of lines) {
                if (!line.trim())
                    continue;
                const [paneTty, identifier] = line.split('|');
                if (paneTty === tty && identifier) {
                    return {
                        type: 'tmux',
                        identifier,
                        tty
                    };
                }
            }
        }
        catch (error) {
            // tmux might not be installed or running
        }
        return null;
    }
    async findITerm2Session(tty) {
        try {
            // Check if iTerm2 is running first to avoid launching it
            const { stdout: isRunning } = await execAsync('pgrep -x iTerm2 || echo "no"');
            if (isRunning.trim() === "no")
                return null;
            const script = `
        tell application "iTerm"
          repeat with w in windows
            repeat with t in tabs of w
              repeat with s in sessions of t
                if tty of s is "${tty}" then
                  return "found"
                end if
              end repeat
            end repeat
          end repeat
        end tell
      `;
            const { stdout } = await execAsync(`osascript -e '${script}'`);
            if (stdout.trim() === "found") {
                return {
                    type: 'iterm2',
                    identifier: tty,
                    tty
                };
            }
        }
        catch (error) {
            // iTerm2 not found or script failed
        }
        return null;
    }
    async findTerminalAppWindow(tty) {
        try {
            // Check if Terminal is running
            const { stdout: isRunning } = await execAsync('pgrep -x Terminal || echo "no"');
            if (isRunning.trim() === "no")
                return null;
            const script = `
        tell application "Terminal"
          repeat with w in windows
            repeat with t in tabs of w
              if tty of t is "${tty}" then
                return "found"
              end if
            end repeat
          end repeat
        end tell
      `;
            const { stdout } = await execAsync(`osascript -e '${script}'`);
            if (stdout.trim() === "found") {
                return {
                    type: 'terminal-app',
                    identifier: tty,
                    tty
                };
            }
        }
        catch (error) {
            // Terminal not found or script failed
        }
        return null;
    }
    async focusTmuxPane(identifier) {
        try {
            await execAsync(`tmux switch-client -t ${identifier}`);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async focusITerm2Session(tty) {
        const script = `
       tell application "iTerm"
         activate
         repeat with w in windows
           repeat with t in tabs of w
             repeat with s in sessions of t
               if tty of s is "${tty}" then
                 select s
                 return "true"
               end if
             end repeat
           end repeat
         end repeat
       end tell
     `;
        const { stdout } = await execAsync(`osascript -e '${script}'`);
        return stdout.trim() === "true";
    }
    async focusTerminalAppWindow(tty) {
        const script = `
       tell application "Terminal"
         activate
         repeat with w in windows
           repeat with t in tabs of w
             if tty of t is "${tty}" then
               set index of w to 1
               set selected tab of w to t
               return "true"
             end if
           end repeat
         end repeat
       end tell
    `;
        const { stdout } = await execAsync(`osascript -e '${script}'`);
        return stdout.trim() === "true";
    }
}
exports.TerminalFocusManager = TerminalFocusManager;
//# sourceMappingURL=TerminalFocusManager.js.map