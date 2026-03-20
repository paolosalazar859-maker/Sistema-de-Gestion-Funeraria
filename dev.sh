#!/bin/bash
npx concurrently "npx vite" "npx wait-on http://localhost:5173 && npx electron electron.js"
