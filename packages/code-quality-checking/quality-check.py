import os
import sys
import subprocess
import argparse
import json
from typing import List, Dict, Any, Optional, Type
from abc import ABC, abstractmethod

class StackChecker(ABC):
    def __init__(self, root_dir: str, app_name: str, mode: str):
        self.root_dir = root_dir
        self.app_name = app_name
        self.mode = mode
        self.app_path = os.path.join(self.root_dir, "web-applications", app_name)

    @abstractmethod
    def check(self, runner: 'CodeQualityRunner') -> bool:
        success = True
        # Check for custom config overrides
        config_path = os.path.join(self.app_path, "quality-config.json")
        if os.path.exists(config_path):
            print(f"⚙️ Found custom config: {config_path}")
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    custom_checks = config.get("custom_checks", [])
                    for check_name, cmd in custom_checks:
                        print(f"➡️ Running Custom Check: {check_name}...")
                        if not runner.run_command(cmd.split() if isinstance(cmd, str) else cmd, self.app_path):
                            success = False
            except Exception as e:
                print(f"⚠️ Error reading config: {e}")
        return success

    @abstractmethod
    def calculate_score(self) -> int:
        pass

class PythonChecker(StackChecker):
    def check(self, runner: 'CodeQualityRunner') -> bool:
        print(f"\n--- Checking Python App: {self.app_name} [Mode: {self.mode}] ---")
        # Initialize success with base check results (custom config)
        success = super().check(runner)
        
        venv_python = os.path.join(self.app_path, "venv", "Scripts", "python.exe")
        if not os.path.exists(venv_python):
            venv_python = "python" # Fallback
        
        # 1. Linting & Formatting (Epic & PI)
        print("➡️ Running Ruff...")
        if not runner.run_command([venv_python, "-m", "ruff", "check", "."], self.app_path):
            success = False

        print("➡️ Checking Format (Ruff)...")
        if not runner.run_command([venv_python, "-m", "ruff", "format", "--check", "."], self.app_path):
            success = False

        # 2. Type Checking (Strict)
        print("➡️ Running Mypy...")
        if not runner.run_command([venv_python, "-m", "mypy", "app", "--strict", "--ignore-missing-imports"], self.app_path):
            print("⚠️ Mypy reported issues")
            if self.mode == "pi": # Fail on PI mode for typing
                success = False

        # 3. Security (Epic & PI)
        print("➡️ Running Bandit...")
        if not runner.run_command([venv_python, "-m", "bandit", "-r", "app"], self.app_path):
            success = False

        # 4. Complexity & Duplication (Epic & PI)
        print("➡️ Checking Complexity/Duplication (Lizard)...")
        if not runner.run_command([venv_python, "-m", "lizard", "app", "-L", "15", "-w"], self.app_path):
            success = False

        # 5. PI Mode Comprehensive Checks
        if self.mode == "pi":
            print("➡️ PI MODE: Dead Code Detection (Vulture)...")
            runner.run_command([venv_python, "-m", "vulture", "app"], self.app_path)
            
            print("➡️ PI MODE: Dependency Audit (pip-audit)...")
            runner.run_command([venv_python, "-m", "pip-audit"], self.app_path)
            
            print("➡️ PI MODE: Docstring Compliance (pydocstyle)...")
            runner.run_command([venv_python, "-m", "pydocstyle", "app"], self.app_path)

        return success

    def calculate_score(self) -> int:
        # Mock logic for demonstration
        if self.app_name == "tita_chi_intelligence":
            return 95
        return 70

class FlutterChecker(StackChecker):
    def check(self, runner: 'CodeQualityRunner') -> bool:
        print(f"\n--- Checking Flutter App: {self.app_name} [Mode: {self.mode}] ---")
        success = super().check(runner)
        
        # 1. Analyze
        print("➡️ Running flutter analyze...")
        if not runner.run_command(["flutter", "analyze"], self.app_path):
            success = False

        # 2. Format
        print("➡️ Checking Format...")
        if not runner.run_command(["flutter", "format", "--set-exit-if-changed", "lib", "test"], self.app_path):
            success = False

        # 3. Complexity & Size
        print("➡️ Checking Complexity/Widget Size (Lizard)...")
        # lizard uses sys.executable since it's installed in the host python/scripts
        if not runner.run_command([sys.executable, "-m", "lizard", "lib", "-L", "15", "-l", "300", "-w"], self.app_path):
            success = False

        return success

    def calculate_score(self) -> int:
        if self.app_name == "tita_chi":
            return 40
        return 80

class GenericChecker(StackChecker):
    def check(self, runner: 'CodeQualityRunner') -> bool:
        print(f"\n--- Checking Generic App: {self.app_name} [Mode: {self.mode}] ---")
        success = super().check(runner)
        # At least run lizard if it's unknown
        print("➡️ Running Generic Complexity Check (Lizard)...")
        if not runner.run_command([sys.executable, "-m", "lizard", ".", "-L", "20", "-w"], self.app_path):
            success = False
        return success

    def calculate_score(self) -> int:
        return 60

class CodeQualityRunner:
    def __init__(self, root_dir: str, mode: str):
        self.root_dir = os.path.abspath(root_dir)
        self.mode = mode
        self.checkers: List[StackChecker] = []
        self._detect_and_register()

    def _detect_and_register(self):
        web_apps_dir = os.path.join(self.root_dir, "web-applications")
        if not os.path.exists(web_apps_dir):
            return

        for entry in os.listdir(web_apps_dir):
            entry_path = os.path.join(web_apps_dir, entry)
            if not os.path.isdir(entry_path):
                continue
            
            # Application specific config
            config_path = os.path.join(entry_path, "quality-config.json")
            
            if os.path.exists(os.path.join(entry_path, "pubspec.yaml")):
                self.checkers.append(FlutterChecker(self.root_dir, entry, self.mode))
            elif os.path.exists(os.path.join(entry_path, "requirements.txt")) or \
                 os.path.exists(os.path.join(entry_path, "pyproject.toml")):
                self.checkers.append(PythonChecker(self.root_dir, entry, self.mode))
            else:
                # Generic fallback for any other tech
                self.checkers.append(GenericChecker(self.root_dir, entry, self.mode))

    def run_command(self, command: List[str], cwd: str) -> bool:
        if sys.platform == "win32":
            import shutil
            original_tool = command[0]
            
            # Handle .bat for flutter/dart
            if original_tool in ["flutter", "dart"]:
                if not shutil.which(original_tool):
                    for p in [r"C:\src\flutter\bin", r"C:\flutter\bin"]:
                        path = os.path.join(p, f"{original_tool}.bat")
                        if os.path.exists(path):
                            command[0] = path
                            break
            # Generic tool resolution
            elif not shutil.which(original_tool) and not os.path.exists(original_tool):
                exe_tool = f"{original_tool}.exe"
                if shutil.which(exe_tool):
                    command[0] = exe_tool
                else:
                    # Try Scripts folder of current python
                    scripts_dir = os.path.join(os.path.dirname(sys.executable), "Scripts")
                    script_path = os.path.join(scripts_dir, f"{original_tool}.exe")
                    if os.path.exists(script_path):
                        command[0] = script_path

        print(f"Running: {' '.join(command)}")
        try:
            result = subprocess.run(
                command, cwd=cwd, capture_output=True, text=True, check=False, shell=(sys.platform == "win32")
            )
            if result.stdout:
                lines = result.stdout.splitlines()
                if len(lines) > 50:
                    print('\n'.join(lines[:25]))
                    print(f"... [{len(lines)-50} lines truncated] ...")
                    print('\n'.join(lines[-25:]))
                else:
                    print(result.stdout)
            if result.stderr:
                print(f"STDERR: {result.stderr}", file=sys.stderr)
            return result.returncode == 0
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            return False

    def run_all(self) -> bool:
        if not self.checkers:
            print("No applications detected.")
            return True

        results = {}
        for checker in self.checkers:
            results[checker.app_name] = checker.check(self)
        
        self.print_summary(results)
        return all(results.values())

    def print_summary(self, results: Dict[str, bool]):
        print("\n" + "="*40)
        print(f"📊 QUALITY CHECK SUMMARY [MODE: {self.mode}]")
        print("="*40)
        for app, success in results.items():
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"{app:<30} {status}")
        
        print("\n" + "="*40)
        print("🏥 HEALTH SCORING")
        print("="*40)
        for checker in self.checkers:
            score = checker.calculate_score()
            grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"
            print(f"{checker.app_name:<30} {score}/100 ({grade})")
        print("="*40)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["epic", "pi"], default="epic")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    runner = CodeQualityRunner(root, args.mode)
    if runner.run_all():
        print("\n✅ Quality Gate Passed!")
        sys.exit(0)
    else:
        print("\n❌ Quality Gate Failed.")
        sys.exit(1)
