#!/bin/bash
set -e

WEB_ROOT="/var/www/html"

if [ -d "$WEB_ROOT" ]; then
  find "$WEB_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
else
  mkdir -p "$WEB_ROOT"
fi