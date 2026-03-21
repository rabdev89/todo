#!/bin/bash
set -e

# Source the dynamic CI configuration
source "$(dirname "$0")/ci_config.sh"

echo "======================================"
echo "🛡️  Running Multistack Quality Checks"
echo "======================================"

ROOT_DIR=$(pwd)

# Use the unified quality checker
echo "➡️ Running Unified Quality Checker..."
./web-applications/tita_chi_intelligence/venv/Scripts/python.exe packages/code-quality-checking/quality-check.py

echo "======================================"
echo "✅ All Quality Checks Completed!"
echo "======================================"
