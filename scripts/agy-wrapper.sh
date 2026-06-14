#!/bin/bash

FILE="$1"
LINE="$2"
COL="$3"

if [ -n "$LINE" ]; then
  FILE="${FILE}:${LINE}"
  if [ -n "$COL" ]; then
    FILE="${FILE}:${COL}"
  fi
fi

/Users/chemex/.antigravity/antigravity/bin/agy --goto "$FILE"