
#!/bin/bash

# This script increments the patch version in the version.ts file
# It should be invoked before committing changes

VERSION_FILE="src/constants/version.ts"
CURRENT_VERSION=$(grep -o "APP_VERSION = '[0-9]\+\.[0-9]\+\.[0-9]\+'" $VERSION_FILE | grep -o "[0-9]\+\.[0-9]\+\.[0-9]\+")

# Split version into components
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Increment patch version
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Update the version in the file
sed -i "s/APP_VERSION = '[0-9]\+\.[0-9]\+\.[0-9]\+'/APP_VERSION = '$NEW_VERSION'/g" $VERSION_FILE

# Add current date to newest changelog entry
TODAY=$(date +%Y-%m-%d)
sed -i "0,/date: '[0-9]\+-[0-9]\+-[0-9]\+'/s//date: '$TODAY'/" $VERSION_FILE

echo "Version updated to $NEW_VERSION"

# Stage the modified file
git add $VERSION_FILE

# Instructions for setting up the git hook
echo ""
echo "To automate version incrementing on commit, set up a pre-commit hook:"
echo "1. Create/edit .git/hooks/pre-commit"
echo "2. Add: ./increment-version.sh"
echo "3. Make it executable: chmod +x .git/hooks/pre-commit"
