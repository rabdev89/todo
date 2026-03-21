---
description: Install make on Windows for framework commands
tags: [windows, setup, make, prerequisite]
---

# Windows Make Installation

> **Prerequisite Workflow**: How to install `make` on Windows so framework commands work.

---

## Problem

On Windows, running `make install-check` or any `make` command fails with:

```powershell
make : The term 'make' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

---

## Solution

### Option 1: Install via Chocolatey (Recommended)

```powershell
# Run as Administrator
choco install make
```

If Chocolatey is not installed:
```powershell
# Install Chocolatey first
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install make
choco install make
```

### Option 2: Install via winget

```powershell
winget install GnuWin32.Make
```

Then add to PATH:
```powershell
$env:Path += ";C:\Program Files (x86)\GnuWin32\bin"
```

### Option 3: Use Git Bash

If you have Git for Windows installed:
1. Open **Git Bash** (not PowerShell)
2. Run `make` commands from Git Bash terminal

### Option 4: Manual Installation

1. Download from: https://gnuwin32.sourceforge.net/packages/make.htm
2. Extract to `C:\Program Files\GnuWin32`
3. Add `C:\Program Files\GnuWin32\bin` to your PATH environment variable

---

## Verification

After installation, verify `make` works:

```powershell
make --version
```

Expected output:
```
GNU Make 4.x
Copyright (C) 2006 Free Software Foundation, Inc.
```

---

## Using Framework Commands on Windows

Once make is installed:

```powershell
# Navigate to framework directory
cd c:\www\blueprinttradingfx\bob-framework

# Run framework commands
make install-check
make install
make test
make start
```

---

## Alternative: PowerShell Scripts

If you cannot install make, use the PowerShell equivalents:

| Make Command | PowerShell Alternative |
|-------------|----------------------|
| `make install-check` | `node --version; npm --version; python --version; docker --version` |
| `make install` | See `install-manual.ps1` (create if needed) |
| `make test` | `node -e "console.log('Health checks would run here')"` |
| `make start` | Manual Docker/Qdrant/Ollama startup |

---

## See Also

- `README.md` - Framework installation guide
- `Makefile` - All available make commands
- `AGENTS_COMMANDS_INDEX.md` - Command reference
