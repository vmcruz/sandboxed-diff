#!/bin/bash

# Ensure script stops on errors
set -e

CURRENT_VERSION=$(node -p "require('./package.json').version")

OLD_IFS=$IFS

IFS='.-' read -r MAJOR MINOR PATCH PREID PRENUM <<< "$CURRENT_VERSION"

IFS=$OLD_IFS

# Check if the current version is a beta
if [[ "$PREID" == "beta" ]]; then
  # If already a beta, bump the prerelease number
  NEW_VERSION=$(npm version prerelease --preid=beta -m "v%s")
else
  # Creates a new beta minor otherwise
  NEW_VERSION=$(npm version preminor --preid=beta -m "v%s")
fi

# Output the new version
echo "Bumped to $NEW_VERSION"
