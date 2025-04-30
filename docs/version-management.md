
# Version Management Guide

## Overview

The Money Flow Guardian application uses semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Incompatible API changes
- MINOR: Functionality added in a backwards compatible manner
- PATCH: Backwards compatible bug fixes

## Automatic Version Increment

The application includes a script that automatically increments the patch version on each commit:

### Setup Instructions

1. Make the script executable:
   ```
   chmod +x increment-version.sh
   ```

2. Set up the Git pre-commit hook:
   ```
   cp pre-commit .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

3. Now, every time you make a commit, the version will automatically increment.

## Changelog Management

When making significant changes:

1. Open `src/constants/version.ts`
2. For minor or major version changes, manually update the version number
3. Add a new changelog entry at the top of the CHANGELOG array:
   ```typescript
   {
     version: '0.2.0',
     date: 'YYYY-MM-DD', // This will be auto-filled on commit
     changes: [
       'New feature A',
       'Improved feature B',
       'Fixed issue C'
     ]
   }
   ```

## Version Display

The current version is displayed in the application footer and users can view the full changelog by clicking on the "Changelog" link.
