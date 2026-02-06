#!/bin/bash
DEST="/Users/vitsoongyoung/Projects/ducviet321.github.io/tinh_thue_tncn"
SRC="/Users/vitsoongyoung/.gemini/antigravity/scratch/tinh_thue_tncn"

echo "Deploying from $SRC to $DEST"

# Ensure destination parent exists
mkdir -p "$(dirname "$DEST")"

# Remove existing if any
rm -rf "$DEST"

# Copy
cp -R "$SRC" "$DEST"

# Git operations
cd "/Users/vitsoongyoung/Projects/ducviet321.github.io"
git add .
# git commit -m "Add Vietnam PIT Calculator (tinh_thue)"
# git push
echo "Done."
