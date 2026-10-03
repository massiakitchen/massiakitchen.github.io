#!/usr/bin/env bash
# Exports the frozen pre-migration site (tag legacy-baseline) to .parity/baseline/
set -euo pipefail
rm -rf .parity/baseline
mkdir -p .parity/baseline
git archive legacy-baseline | tar -x -C .parity/baseline
echo "baseline exported to .parity/baseline"
