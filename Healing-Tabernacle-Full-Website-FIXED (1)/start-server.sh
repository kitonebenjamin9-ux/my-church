#!/bin/bash
cd "$(dirname "$0")"
echo "Starting local server for Healing Tabernacle website..."
echo ""

open_browser() {
  sleep 1
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:8000/index.html" 2>/dev/null
  fi
}

if command -v python3 >/dev/null 2>&1; then
  open_browser &
  python3 -m http.server 8000
elif command -v python >/dev/null 2>&1; then
  open_browser &
  python -m http.server 8000
elif command -v npx >/dev/null 2>&1; then
  echo "Python not found, using npx serve instead..."
  npx serve -l 8000
else
  echo "Could not find Python or Node/npx on this computer."
  echo "Please install Python (https://python.org) or Node.js (https://nodejs.org) and try again."
  read -p "Press Enter to close..."
fi
