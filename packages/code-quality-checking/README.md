# Code Quality Checking Utility

This package provides a tech-agnostic CLI for verifying code quality across multiple application stacks in the BOB Framework project.

## 🚀 Features

- **Stack Detection**: Automatically identifies Python (FastAPI) and Flutter/Dart applications.
- **Python Checks**:
  - `Ruff`: Fast linting and formatting.
  - `Bandit`: Security vulnerability scanning.
  - `Radon`: Cyclomatic complexity analysis.
- **Flutter Checks**:
  - `flutter analyze`: Static analysis.
  - `flutter format`: Code formatting verification.

## 📦 Requirements & Installation

The tool requires several static analysis utilities. You can install all of them using the provided requirements file:

### Setup (Python & Generic Tools)

From the project root:

```bash
# It is recommended to use the backend venv or a dedicated quality venv
cd web-applications/tita_chi_intelligence
./venv/Scripts/python.exe -m pip install -r ../../packages/code-quality-checking/requirements.txt
```

This will install:

- `ruff`: Linting and formatting
- `bandit`: Security checks
- `radon`: Complexity analysis (legacy)
- `mypy`: Strict type checking
- `lizard`: Cross-stack complexity & duplication scanning

### Setup (Flutter)

Requires the **Flutter SDK** to be installed and available in your `PATH`. On Windows, the tool will attempt to automatically find it at `C:\src\flutter\bin` or `C:\flutter\bin` if not in the `PATH`.

---

## 🛠️ Usage

### Checking Modes

The tool now supports two hardening levels as defined in `project-management/code_quality_framework.md`:

- **Epic Mode** (Default): Fast checks for daily iteration.
  ```bash
  python packages/code-quality-checking/quality-check.py --mode epic
  ```
- **PI Mode**: Comprehensive enterprise-grade analysis including dead code detection, dependency audits, and docstring compliance.
  ```bash
  python packages/code-quality-checking/quality-check.py --mode pi
  ```

---

## 🧩 Extensibility (Multi-Stack)

The framework is tech-agnostic and uses a plugin-based architecture.

### Automatic Support

- **Python**: Ruff, Bandit, Radon, Mypy, Vulture, pip-audit, pydocstyle.
- **Flutter**: flutter analyze, flutter format, Lizard complexity.
- **Generic**: Any other directory will default to **Lizard** (supporting 10+ languages) for complexity and duplication metrics.

### Custom Project Configuration

You can define custom quality checks for any service by creating a `quality-config.json` in its directory:

```json
{
  "custom_checks": [
    ["Custom Tool", "tool-command --arg"],
    ["Format Check", "npm run lint"]
  ]
}
```

The checker will automatically detect this file and execute the defined commands as part of the quality gate.
